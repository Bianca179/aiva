"""Rumaenischsprachiger Assistent auf Basis der Claude API.

Der Bot beantwortet Fragen zu Umsatz, offenen Rechnungen und fehlenden Belegen
(Tools greifen auf dieselbe Datenschicht zu wie das Dashboard) und kann optional
das Beleg-Postfach durchsuchen.
"""

from __future__ import annotations

import json

import anthropic

from . import config, service
from .mail_importer import search_mailbox

SYSTEM_PROMPT = """\
Esti AIVA, asistenta digitala a unei firme de curatenie din Germania. Utilizatoarea
este proprietara firmei. Limba ei materna este romana - raspunde intotdeauna in
romana, simplu si prietenos, fara jargon contabil. Cand folosesti termeni oficiali
germani (de ex. "Rechnung", "Beleg", "Umsatzsteuer"), explica-i pe scurt in romana,
pentru ca ea va intalni acesti termeni in scrisori oficiale si in Lexware.

Ai acces prin tools la datele contabile din Lexware (cifra de afaceri, facturi
deschise/restante, documente lipsa) si la casuta de e-mail pentru facturi.
Foloseste tools inainte sa raspunzi la intrebari despre cifre - nu inventa valori.
Sumele sunt in euro; formateaza-le clar (de ex. 4.820,00 EUR).

Daca lipsesc documente justificative (Belege), explica-i calm de ce sunt importante
(obligatie fiscala in Germania) si ce trebuie sa faca concret: sa trimita factura
sau bonul pe adresa de e-mail dedicata, de unde ajunge automat in Lexware.
"""

TOOLS = [
    {
        "name": "get_summary",
        "description": (
            "Rezumatul financiar curent din Lexware: cifra de afaceri si cheltuieli "
            "pe luni, facturi deschise si restante, numarul documentelor lipsa. "
            "Apeleaza acest tool pentru orice intrebare despre cifre, venituri sau situatia generala."
        ),
        "input_schema": {"type": "object", "properties": {}, "additionalProperties": False},
    },
    {
        "name": "get_open_invoices",
        "description": (
            "Lista facturilor de vanzare deschise si restante (numar, client, scadenta, suma). "
            "Apeleaza cand utilizatoarea intreaba cine nu a platit sau ce facturi sunt restante."
        ),
        "input_schema": {"type": "object", "properties": {}, "additionalProperties": False},
    },
    {
        "name": "get_missing_receipts",
        "description": (
            "Lista tranzactiilor pentru care lipseste documentul justificativ (Beleg). "
            "Apeleaza cand utilizatoarea intreaba ce documente lipsesc sau ce mai are de trimis."
        ),
        "input_schema": {"type": "object", "properties": {}, "additionalProperties": False},
    },
    {
        "name": "get_bank_matching",
        "description": (
            "Rezultatul reconcilierii bancare: care facturi sunt platite conform extrasului "
            "de cont (chiar daca in Lexware apar inca deschise), platile alocate pe facturi "
            "(inclusiv plati colective cu numar de aviz) si incasarile nealocate. "
            "Apeleaza cand utilizatoarea intreaba ce s-a platit deja sau ce plati au sosit."
        ),
        "input_schema": {"type": "object", "properties": {}, "additionalProperties": False},
    },
    {
        "name": "search_emails",
        "description": (
            "Cauta in casuta de e-mail pentru facturi (expeditor/subiect). Apeleaza cand "
            "utilizatoarea intreaba daca a sosit o factura pe e-mail sau ce e-mailuri exista."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Text cautat in subiect sau expeditor (poate fi gol pentru cele mai noi mesaje)",
                },
                "limit": {"type": "integer", "description": "Numar maxim de rezultate (implicit 10)"},
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
]


def _run_tool(name: str, tool_input: dict) -> str:
    if name == "get_summary":
        return json.dumps(service.get_summary(), ensure_ascii=False)
    if name == "get_open_invoices":
        return json.dumps(service.get_open_invoices(), ensure_ascii=False)
    if name == "get_missing_receipts":
        return json.dumps(service.get_missing_receipts(), ensure_ascii=False)
    if name == "get_bank_matching":
        return json.dumps(service.get_bank_matching(), ensure_ascii=False)
    if name == "search_emails":
        results = search_mailbox(tool_input.get("query", ""), int(tool_input.get("limit", 10)))
        return json.dumps(results, ensure_ascii=False)
    raise ValueError(f"Unbekanntes Tool: {name}")


def chat(message: str, history: list[dict] | None = None) -> str:
    """Eine Chat-Runde inkl. Tool-Loop. `history` = bisherige {role, content}-Turns."""
    if not config.ANTHROPIC_API_KEY:
        return (
            "Chatbotul nu este inca activat (lipseste ANTHROPIC_API_KEY). "
            "Dashboardul functioneaza si fara chat."
        )

    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    messages = list(history or []) + [{"role": "user", "content": message}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=4096,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        if response.stop_reason != "tool_use":
            return next((b.text for b in response.content if b.type == "text"), "")

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            try:
                result = _run_tool(block.name, block.input)
                tool_results.append(
                    {"type": "tool_result", "tool_use_id": block.id, "content": result}
                )
            except Exception as exc:  # Fehler ans Modell zurueckgeben statt abbrechen
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": f"Fehler: {exc}",
                        "is_error": True,
                    }
                )
        messages.append({"role": "user", "content": tool_results})
