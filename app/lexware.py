"""Client fuer die Lexware Office Public API (ehem. lexoffice).

Doku: https://developers.lexware.io/docs/  (Bearer-Token, max. 2 Requests/Sekunde)
Genutzte Endpunkte:
  GET  /v1/profile        -> Organisationsdaten (Verbindungstest)
  GET  /v1/voucherlist    -> Belegliste (Rechnungen, Status offen/ueberfaellig/bezahlt)
  POST /v1/files          -> Beleg-Upload in die Lexware-Belegablage (type=voucher)
"""

from __future__ import annotations

import time
from typing import Any

import httpx

BASE_URL = "https://api.lexware.io/v1"
# Uebergangsweise ist auch die alte Domain aktiv:
LEGACY_BASE_URL = "https://api.lexoffice.io/v1"


class LexwareError(RuntimeError):
    pass


class LexwareClient:
    def __init__(self, api_key: str, base_url: str = BASE_URL, timeout: float = 30.0):
        if not api_key:
            raise LexwareError("LEXWARE_API_KEY fehlt")
        self._client = httpx.Client(
            base_url=base_url,
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json",
            },
        )
        self._last_request = 0.0

    def _throttle(self) -> None:
        # API-Limit: 2 Requests pro Sekunde
        wait = 0.5 - (time.monotonic() - self._last_request)
        if wait > 0:
            time.sleep(wait)
        self._last_request = time.monotonic()

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        self._throttle()
        resp = self._client.get(path, params=params)
        if resp.status_code != 200:
            raise LexwareError(f"GET {path} -> {resp.status_code}: {resp.text[:300]}")
        return resp.json()

    def profile(self) -> dict:
        return self._get("/profile")

    def voucherlist(
        self,
        voucher_type: str = "salesinvoice",
        voucher_status: str = "open,overdue",
        page_size: int = 250,
    ) -> list[dict]:
        """Alle Seiten der Belegliste einsammeln."""
        vouchers: list[dict] = []
        page = 0
        while True:
            data = self._get(
                "/voucherlist",
                params={
                    "voucherType": voucher_type,
                    "voucherStatus": voucher_status,
                    "size": page_size,
                    "page": page,
                    "sort": "voucherDate,DESC",
                },
            )
            vouchers.extend(data.get("content", []))
            if data.get("last", True):
                return vouchers
            page += 1

    def upload_voucher_file(self, filename: str, content: bytes, mime_type: str) -> str:
        """Laedt eine Datei in die Lexware-Belegablage hoch, gibt die File-ID zurueck."""
        self._throttle()
        resp = self._client.post(
            "/files",
            files={"file": (filename, content, mime_type)},
            data={"type": "voucher"},
        )
        if resp.status_code not in (200, 201, 202):
            raise LexwareError(f"POST /files -> {resp.status_code}: {resp.text[:300]}")
        return resp.json().get("id", "")

    def close(self) -> None:
        self._client.close()
