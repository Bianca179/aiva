"""Import von Kontoumsaetzen aus Bank-CSV-Exporten.

Erkennt die gaengigen deutschen Export-Formate (Sparkasse, VR, Deutsche Bank,
comdirect ...) anhand der Spaltenueberschriften; Trennzeichen und Datums-/
Betragsformat werden automatisch erkannt. Die geparsten Umsaetze und die
Avis-Zuordnungen liegen als JSON unter data/.
"""

from __future__ import annotations

import csv
import io
import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
TRANSACTIONS_FILE = DATA_DIR / "bank_transactions.json"
AVIS_FILE = DATA_DIR / "avis.json"  # {"4711": ["RE-2026-0141", ...]}

# Moegliche Spaltenueberschriften je Feld (normalisiert: klein, ohne Sonderzeichen)
COLUMN_ALIASES = {
    "date": ["buchungstag", "buchungsdatum", "buchungstagvaluta", "datum", "valutadatum", "wertstellung"],
    "amount": ["betrag", "betrageur", "umsatz", "umsatzineur", "amount"],
    "counterparty": [
        "beguenstigterzahlungspflichtiger", "namezahlungsbeteiligter",
        "auftraggeberempfaenger", "empfaenger", "zahlungspflichtiger",
        "beguenstigter", "name",
    ],
    "reference": ["verwendungszweck", "referenz", "buchungstext", "umsatzart"],
}


def _norm_header(h: str) -> str:
    return re.sub(r"[^a-z]", "", h.lower())


def _parse_amount(raw: str) -> float:
    s = raw.strip().replace("€", "").replace("EUR", "").strip()
    if "," in s:  # deutsches Format: 1.234,56
        s = s.replace(".", "").replace(",", ".")
    return float(s)


def _parse_date(raw: str) -> str:
    s = raw.strip()
    m = re.match(r"^(\d{2})\.(\d{2})\.(\d{2,4})$", s)
    if m:
        day, month, year = m.groups()
        if len(year) == 2:
            year = "20" + year
        return f"{year}-{month}-{day}"
    return s[:10]  # ISO oder unbekannt -> unveraendert


def parse_csv(content: bytes) -> list[dict]:
    text = content.decode("utf-8-sig", errors="replace")
    dialect = csv.Sniffer().sniff(text[:2048], delimiters=";,\t")
    reader = csv.DictReader(io.StringIO(text), dialect=dialect)

    columns: dict[str, str] = {}
    for header in reader.fieldnames or []:
        n = _norm_header(header)
        for field, aliases in COLUMN_ALIASES.items():
            if field not in columns and n in aliases:
                columns[field] = header
    if "date" not in columns or "amount" not in columns:
        raise ValueError(
            f"CSV-Spalten nicht erkannt (gefunden: {reader.fieldnames}). "
            "Benoetigt werden mindestens Buchungstag und Betrag."
        )

    transactions = []
    for row in reader:
        try:
            amount = _parse_amount(row[columns["amount"]])
        except (ValueError, TypeError):
            continue  # Summen-/Leerzeilen ueberspringen
        transactions.append(
            {
                "date": _parse_date(row[columns["date"]] or ""),
                "amount": amount,
                "counterparty": (row.get(columns.get("counterparty", ""), "") or "").strip(),
                "reference": (row.get(columns.get("reference", ""), "") or "").strip(),
            }
        )
    return transactions


def save_transactions(transactions: list[dict]) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    TRANSACTIONS_FILE.write_text(json.dumps(transactions, ensure_ascii=False, indent=1))


def load_transactions() -> list[dict]:
    if TRANSACTIONS_FILE.exists():
        return json.loads(TRANSACTIONS_FILE.read_text())
    return []


def load_avis_map() -> dict[str, list[str]]:
    if AVIS_FILE.exists():
        return json.loads(AVIS_FILE.read_text())
    return {}
