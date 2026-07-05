"""Realistische Beispieldaten fuer den Demo-Modus.

Profil: Gebaeudereinigung, ~250.000 EUR Umsatz im 1. Halbjahr 2026,
Umstellung auf Lexware Office im Januar 2026, einzelne Belege fehlen noch.
"""

MONTHLY = [
    {"month": "2026-01", "revenue": 36400.00, "expenses": 24100.00},
    {"month": "2026-02", "revenue": 38950.00, "expenses": 25300.00},
    {"month": "2026-03", "revenue": 42800.00, "expenses": 27950.00},
    {"month": "2026-04", "revenue": 41200.00, "expenses": 26400.00},
    {"month": "2026-05", "revenue": 44650.00, "expenses": 28800.00},
    {"month": "2026-06", "revenue": 46300.00, "expenses": 29650.00},
]

OPEN_INVOICES = [
    {
        "voucherNumber": "RE-2026-0141",
        "contactName": "Hausverwaltung Sonnenhof GmbH",
        "voucherDate": "2026-06-02",
        "dueDate": "2026-06-16",
        "totalAmount": 4820.00,
        "openAmount": 4820.00,
        "status": "overdue",
    },
    {
        "voucherNumber": "RE-2026-0148",
        "contactName": "Autohaus Brenner KG",
        "voucherDate": "2026-06-10",
        "dueDate": "2026-06-24",
        "totalAmount": 2380.00,
        "openAmount": 2380.00,
        "status": "overdue",
    },
    {
        "voucherNumber": "RE-2026-0153",
        "contactName": "Praxisklinik am Ring",
        "voucherDate": "2026-06-18",
        "dueDate": "2026-07-02",
        "totalAmount": 6150.00,
        "openAmount": 6150.00,
        "status": "overdue",
    },
    {
        "voucherNumber": "RE-2026-0157",
        "contactName": "REWE Markt Feldstrasse",
        "voucherDate": "2026-06-25",
        "dueDate": "2026-07-09",
        "totalAmount": 3940.00,
        "openAmount": 3940.00,
        "status": "open",
    },
    {
        "voucherNumber": "RE-2026-0159",
        "contactName": "Buerohaus Nordpark GmbH & Co. KG",
        "voucherDate": "2026-06-30",
        "dueDate": "2026-07-14",
        "totalAmount": 5230.00,
        "openAmount": 5230.00,
        "status": "open",
    },
]

MISSING_RECEIPTS = [
    {
        "date": "2026-05-12",
        "description": "Kartenzahlung Tankstelle Aral",
        "amount": -86.40,
        "hint": "Tankbeleg fehlt",
    },
    {
        "date": "2026-05-28",
        "description": "Ueberweisung 'Reinigungsmittel Grosshandel'",
        "amount": -412.75,
        "hint": "Eingangsrechnung fehlt",
    },
    {
        "date": "2026-06-04",
        "description": "Kartenzahlung Bauhaus",
        "amount": -139.90,
        "hint": "Kassenbon fehlt",
    },
    {
        "date": "2026-06-17",
        "description": "Lastschrift Telekom Geschaeftskunden",
        "amount": -74.99,
        "hint": "Rechnung fehlt",
    },
    {
        "date": "2026-06-23",
        "description": "Kartenzahlung Metro",
        "amount": -268.30,
        "hint": "Kassenbon fehlt",
    },
]
