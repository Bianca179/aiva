import os

from dotenv import load_dotenv

load_dotenv()


def _bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in ("1", "true", "yes")


LEXWARE_API_KEY = os.environ.get("LEXWARE_API_KEY", "")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

IMAP_HOST = os.environ.get("IMAP_HOST", "")
IMAP_USER = os.environ.get("IMAP_USER", "")
IMAP_PASSWORD = os.environ.get("IMAP_PASSWORD", "")
IMAP_FOLDER = os.environ.get("IMAP_FOLDER", "INBOX")
MAIL_ALLOWED_SENDERS = [
    s.strip().lower()
    for s in os.environ.get("MAIL_ALLOWED_SENDERS", "").split(",")
    if s.strip()
]
MAIL_POLL_SECONDS = int(os.environ.get("MAIL_POLL_SECONDS", "300"))

# Ohne Lexware-Key laeuft die App automatisch im Demo-Modus.
DEMO_MODE = _bool("DEMO_MODE", True) or not LEXWARE_API_KEY
