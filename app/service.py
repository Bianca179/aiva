"""Datenschicht: liefert Dashboard-Daten aus Lexware oder aus den Demo-Daten
und gleicht Kontoumsaetze gegen Rechnungen/Belege ab."""

from __future__ import annotations

from collections import defaultdict
from datetime import date

from . import bank_import, config, demo_data, matcher
from .lexware import LexwareClient

_client: LexwareClient | None = None


def _lexware() -> LexwareClient:
    global _client
    if _client is None:
        _client = LexwareClient(config.LEXWARE_API_KEY)
    return _client


def get_open_invoices() -> list[dict]:
    """Offene Rechnungen laut Lexware, angereichert um den Bank-Status:
    status 'paid_bank' = laut Kontoumsatz bezahlt, in Lexware noch offen."""
    invoices = _open_invoices_raw()
    paid = set(get_bank_matching()["paidInvoiceNumbers"])
    for inv in invoices:
        if inv["voucherNumber"] in paid:
            inv["status"] = "paid_bank"
    return invoices


def _open_invoices_raw() -> list[dict]:
    if config.DEMO_MODE:
        return [dict(i) for i in demo_data.OPEN_INVOICES]
    today = date.today().isoformat()
    result = []
    for v in _lexware().voucherlist("salesinvoice", "open,overdue"):
        due = (v.get("dueDate") or "")[:10]
        result.append(
            {
                "voucherNumber": v.get("voucherNumber", ""),
                "contactName": v.get("contactName", ""),
                "voucherDate": (v.get("voucherDate") or "")[:10],
                "dueDate": due,
                "totalAmount": v.get("totalAmount", 0.0),
                "openAmount": v.get("openAmount", v.get("totalAmount", 0.0)),
                "status": "overdue" if due and due < today else "open",
            }
        )
    return result


def get_bank_matching() -> dict:
    """Kontoumsaetze gegen offene Rechnungen und Einkaufsbelege abgleichen."""
    if config.DEMO_MODE:
        transactions = demo_data.BANK_TRANSACTIONS
        avis_map = demo_data.AVIS_MAP
        purchase_vouchers = demo_data.PURCHASE_VOUCHERS
    else:
        transactions = bank_import.load_transactions()
        avis_map = bank_import.load_avis_map()
        purchase_vouchers = (
            _lexware().voucherlist("purchaseinvoice", "open,overdue,paid")
            if transactions
            else []
        )
    result = matcher.match(transactions, _open_invoices_raw(), purchase_vouchers, avis_map)
    result["hasBankData"] = bool(transactions)
    return result


def get_missing_receipts() -> list[dict]:
    return get_bank_matching()["missingReceipts"]


def get_summary() -> dict:
    monthly = demo_data.MONTHLY if config.DEMO_MODE else _monthly_from_lexware()
    invoices = get_open_invoices()
    matching = get_bank_matching()

    revenue_total = round(sum(m["revenue"] for m in monthly), 2)
    expenses_total = round(sum(m["expenses"] for m in monthly), 2)
    paid_bank = [i for i in invoices if i["status"] == "paid_bank"]
    really_open = [i for i in invoices if i["status"] != "paid_bank"]
    overdue = [i for i in really_open if i["status"] == "overdue"]
    return {
        "demoMode": config.DEMO_MODE,
        "hasBankData": matching["hasBankData"],
        "period": {"from": monthly[0]["month"], "to": monthly[-1]["month"]} if monthly else None,
        "revenueTotal": revenue_total,
        "expensesTotal": expenses_total,
        "resultTotal": round(revenue_total - expenses_total, 2),
        "openInvoicesCount": len(really_open),
        "openInvoicesTotal": round(sum(i["openAmount"] for i in really_open), 2),
        "overdueCount": len(overdue),
        "overdueTotal": round(sum(i["openAmount"] for i in overdue), 2),
        "paidBankCount": len(paid_bank),
        "paidBankTotal": round(sum(i["openAmount"] for i in paid_bank), 2),
        "missingReceiptsCount": len(matching["missingReceipts"]),
        "monthly": monthly,
    }


def import_bank_csv(content: bytes) -> dict:
    transactions = bank_import.parse_csv(content)
    bank_import.save_transactions(transactions)
    return {"imported": len(transactions)}


def _monthly_from_lexware() -> list[dict]:
    """Monats-Summen aus der Belegliste aggregieren (Rechnungen + Eingangsrechnungen)."""
    revenue: dict[str, float] = defaultdict(float)
    expenses: dict[str, float] = defaultdict(float)
    year = date.today().year
    for v in _lexware().voucherlist("salesinvoice", "open,overdue,paid"):
        month = (v.get("voucherDate") or "")[:7]
        if month.startswith(str(year)):
            revenue[month] += v.get("totalAmount", 0.0)
    for v in _lexware().voucherlist("purchaseinvoice", "open,overdue,paid"):
        month = (v.get("voucherDate") or "")[:7]
        if month.startswith(str(year)):
            expenses[month] += v.get("totalAmount", 0.0)
    months = sorted(set(revenue) | set(expenses))
    return [
        {"month": m, "revenue": round(revenue[m], 2), "expenses": round(expenses[m], 2)}
        for m in months
    ]
