"""Beleg-Import: holt Anhaenge aus einem IMAP-Postfach und laedt sie in die
Lexware-Belegablage hoch.

Das ersetzt die fehleranfaellige Weiterleitung an die Lexware-Upload-Adresse:
Wir holen die Mails selbst ab, deshalb ist egal, von welchem Absender die
Original-Rechnung kommt. Verarbeitete Mails werden als gelesen markiert und
mit dem IMAP-Flag "AIVA-Imported" versehen.

Start als eigener Prozess:  python -m app.mail_importer
"""

from __future__ import annotations

import email
import imaplib
import logging
import time
from email.header import decode_header
from email.message import Message

from . import config
from .lexware import LexwareClient

log = logging.getLogger("mail_importer")

ACCEPTED_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}
IMPORTED_FLAG = "AIVA-Imported"


def _decode(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    return "".join(
        p.decode(enc or "utf-8", errors="replace") if isinstance(p, bytes) else p
        for p, enc in parts
    )


def _sender_allowed(msg: Message) -> bool:
    if not config.MAIL_ALLOWED_SENDERS:
        return True
    sender = email.utils.parseaddr(msg.get("From", ""))[1].lower()
    return sender in config.MAIL_ALLOWED_SENDERS


def _attachments(msg: Message) -> list[tuple[str, bytes, str]]:
    files = []
    for part in msg.walk():
        mime = part.get_content_type()
        if mime not in ACCEPTED_TYPES:
            continue
        payload = part.get_payload(decode=True)
        if not payload:
            continue
        name = _decode(part.get_filename()) or f"beleg{ACCEPTED_TYPES[mime]}"
        files.append((name, payload, mime))
    return files


def _connect() -> imaplib.IMAP4_SSL:
    conn = imaplib.IMAP4_SSL(config.IMAP_HOST)
    conn.login(config.IMAP_USER, config.IMAP_PASSWORD)
    conn.select(config.IMAP_FOLDER)
    return conn


def run_once() -> int:
    """Verarbeitet alle noch nicht importierten Mails. Gibt Anzahl Uploads zurueck."""
    if not (config.IMAP_HOST and config.IMAP_USER and config.IMAP_PASSWORD):
        log.warning("IMAP nicht konfiguriert - Import uebersprungen")
        return 0

    lexware = LexwareClient(config.LEXWARE_API_KEY)
    uploaded = 0
    conn = _connect()
    try:
        _, data = conn.search(None, f"(NOT KEYWORD {IMPORTED_FLAG})")
        for num in data[0].split():
            _, msg_data = conn.fetch(num, "(RFC822)")
            msg = email.message_from_bytes(msg_data[0][1])
            subject = _decode(msg.get("Subject"))

            if not _sender_allowed(msg):
                log.info("Absender nicht erlaubt, ueberspringe: %s", subject)
                conn.store(num, "+FLAGS", IMPORTED_FLAG)
                continue

            for name, payload, mime in _attachments(msg):
                file_id = lexware.upload_voucher_file(name, payload, mime)
                uploaded += 1
                log.info("Hochgeladen: %s (%s) -> Lexware file %s", name, subject, file_id)

            conn.store(num, "+FLAGS", f"{IMPORTED_FLAG} \\Seen")
    finally:
        conn.logout()
        lexware.close()
    return uploaded


def search_mailbox(query: str, limit: int = 10) -> list[dict]:
    """Postfach-Suche fuer den Chatbot (Betreff/Absender, neueste zuerst)."""
    if not (config.IMAP_HOST and config.IMAP_USER and config.IMAP_PASSWORD):
        return [{"info": "Casuta de e-mail nu este configurata (IMAP_HOST/USER/PASSWORD)."}]

    conn = _connect()
    try:
        if query:
            criteria = f'(OR SUBJECT "{query}" FROM "{query}")'
        else:
            criteria = "ALL"
        _, data = conn.search(None, criteria)
        results = []
        for num in reversed(data[0].split()[-limit:]):
            _, msg_data = conn.fetch(num, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)])")
            msg = email.message_from_bytes(msg_data[0][1])
            results.append(
                {
                    "from": _decode(msg.get("From")),
                    "subject": _decode(msg.get("Subject")),
                    "date": msg.get("Date", ""),
                }
            )
        return results
    finally:
        conn.logout()


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")
    log.info("Beleg-Import gestartet, Intervall %ss", config.MAIL_POLL_SECONDS)
    while True:
        try:
            count = run_once()
            if count:
                log.info("%s Beleg(e) hochgeladen", count)
        except Exception:
            log.exception("Import-Durchlauf fehlgeschlagen, versuche es spaeter erneut")
        time.sleep(config.MAIL_POLL_SECONDS)


if __name__ == "__main__":
    main()
