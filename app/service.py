"""Datenschicht: liefert Dashboard-Daten aus Lexware oder aus den Demo-Daten."""

from __future__ import annotations

from collections import defaultdict
from datetime import date

from . import config, demo_data
from .lexware import LexwareClient

_client: LexwareClient | None = None


def _lexware() -> LexwareClient:
    global _client
    if _client is None:
        _client = LexwareClient(config.LEXWARE_API_KEY)
    return _client


def get_summary() -> dict:
    if config.DEMO_MODE:
        monthly = demo_data.MONTHLY
        open_invoices = demo_data.OPEN_INVOICES
        missing = demo_data.MISSING_RECEIPTS
    else:
        monthly = _monthly_from_lexware()
        open_invoices = get_open_invoices()
        missing = get_missing_receipts()

    revenue_total = round(sum(m["revenue"] for m in monthly), 2)
    expenses_total = round(sum(m["expenses"] for m in monthly), 2)
    open_total = round(sum(i["openAmount"] for i in open_invoices), 2)
    overdue = [i for i in open_invoices if i["status"] == "overdue"]
    return {
        "demoMode": config.DEMO_MODE,
        "period": {"from": monthly[0]["month"], "to": monthly[-1]["month"]} if monthly else None,
        "revenueTotal": revenue_total,
        "expensesTotal": expenses_total,
        "resultTotal": round(revenue_total - expenses_total, 2),
        "openInvoicesCount": len(open_invoices),
        "openInvoicesTotal": open_total,
        "overdueCount": len(overdue),
        "overdueTotal": round(sum(i["openAmount"] for i in overdue), 2),
        "missingReceiptsCount": len(missing),
        "monthly": monthly,
    }


def get_open_invoices() -> list[dict]:
    if config.DEMO_MODE:
        return demo_data.OPEN_INVOICES
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


def get_missing_receipts() -> list[dict]:
    # Die Public API stellt offene Bank-Transaktionen ohne Beleg nicht bereit
    # (Stand: siehe README, Abschnitt "Grenzen der Lexware API"). Im Live-Betrieb
    # bleibt diese Liste daher leer und die Pruefung passiert in Lexware selbst;
    # der Demo-Modus zeigt, wie die Kachel gedacht ist.
    if config.DEMO_MODE:
        return demo_data.MISSING_RECEIPTS
    return []


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
