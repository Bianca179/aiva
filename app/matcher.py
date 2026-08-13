"""Abgleich Kontoumsaetze <-> Lexware-Belege.

Eingaenge werden offenen Ausgangsrechnungen zugeordnet (dreistufig:
Rechnungsnummer in der Referenz -> Avisnummer -> Betragsheuristik).
Ausgaenge ohne passenden Einkaufsbeleg ergeben die Liste "fehlende Belege",
die die Unternehmerin per Lexware-Scan-App abarbeiten kann.
"""

from __future__ import annotations

import re
from datetime import date

# Abbuchungen, die keinen hochzuladenden Beleg brauchen (Gehalt, Steuern, Bankentgelte ...)
IGNORE_KEYWORDS = [
    "GEHALT", "LOHN", "FINANZAMT", "STEUER", "KONTOFUEHRUNG", "ENTGELT",
    "KREDIT", "TILGUNG", "PRIVATENTNAHME", "KRANKENKASSE", "SOZIALVERSICHERUNG",
    "BERUFSGENOSSENSCHAFT", "IHK",
]

AVIS_RE = re.compile(r"AVIS\W*(?:NR\W*)?([A-Z0-9]+)")

# Ein Einkaufsbeleg gilt als zugehoerig, wenn Betrag exakt passt und das
# Belegdatum hoechstens so viele Tage vom Buchungstag abweicht.
VOUCHER_DATE_TOLERANCE_DAYS = 10


def _norm(text: str | None) -> str:
    return re.sub(r"[^A-Z0-9]", "", (text or "").upper())


def match(
    transactions: list[dict],
    open_invoices: list[dict],
    purchase_vouchers: list[dict],
    avis_map: dict[str, list[str]],
) -> dict:
    credits = [t for t in transactions if t["amount"] > 0]
    debits = [t for t in transactions if t["amount"] < 0]

    matched_payments: list[dict] = []
    paid_invoice_nos: set[str] = set()
    unmatched_credits: list[dict] = []

    for t in credits:
        remaining = [i for i in open_invoices if i["voucherNumber"] not in paid_invoice_nos]
        ref_norm = _norm(f"{t.get('reference', '')} {t.get('counterparty', '')}")

        # Stufe 1: Rechnungsnummer steht in der Referenz
        hits = [i for i in remaining if _norm(i["voucherNumber"]) and _norm(i["voucherNumber"]) in ref_norm]
        method = "invoice_no" if hits else None

        # Stufe 2: Avisnummer -> Rechnungsliste aus dem Zahlungsavis
        if not hits:
            m = AVIS_RE.search((t.get("reference") or "").upper())
            if m and m.group(1) in avis_map:
                avis_invoices = set(avis_map[m.group(1)])
                hits = [i for i in remaining if i["voucherNumber"] in avis_invoices]
                method = "avis" if hits else None

        # Stufe 3: exakter Betrag genau einer offenen Rechnung
        if not hits:
            candidates = [i for i in remaining if abs(i["openAmount"] - t["amount"]) < 0.01]
            if len(candidates) == 1:
                hits, method = candidates, "amount"

        if hits:
            paid_invoice_nos.update(i["voucherNumber"] for i in hits)
            matched_payments.append(
                {
                    "transaction": t,
                    "invoices": [i["voucherNumber"] for i in hits],
                    "invoiceTotal": round(sum(i["openAmount"] for i in hits), 2),
                    "method": method,
                }
            )
        else:
            unmatched_credits.append(t)

    missing_receipts: list[dict] = []
    for t in debits:
        text = f"{t.get('reference', '')} {t.get('counterparty', '')}".upper()
        if any(k in text for k in IGNORE_KEYWORDS):
            continue
        if _has_purchase_voucher(t, purchase_vouchers):
            continue
        missing_receipts.append(
            {
                "date": t["date"],
                "description": t.get("counterparty") or t.get("reference") or "",
                "reference": t.get("reference", ""),
                "amount": t["amount"],
            }
        )

    return {
        "matchedPayments": matched_payments,
        "paidInvoiceNumbers": sorted(paid_invoice_nos),
        "unmatchedCredits": unmatched_credits,
        "missingReceipts": missing_receipts,
    }


def _has_purchase_voucher(transaction: dict, vouchers: list[dict]) -> bool:
    try:
        t_date = date.fromisoformat(transaction["date"])
    except (KeyError, ValueError):
        return False
    for v in vouchers:
        if abs(abs(transaction["amount"]) - v.get("totalAmount", 0.0)) >= 0.01:
            continue
        try:
            v_date = date.fromisoformat((v.get("voucherDate") or "")[:10])
        except ValueError:
            continue
        if abs((v_date - t_date).days) <= VOUCHER_DATE_TOLERANCE_DAYS:
            return True
    return False
