import requests
from typing import Any, Dict, List
from app.config import settings

BASE_URL = f"{settings.SUPABASE_URL}/rest/v1"
API_KEY = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY


def _headers(prefer: str | None = None) -> Dict[str, str]:
    h: Dict[str, str] = {
        "apikey": API_KEY,
        "Authorization": f"Bearer {API_KEY}",
    }
    if prefer:
        h["Prefer"] = prefer
    return h


def sb_select(table: str, params: Dict[str, str] | None = None) -> List[Dict[str, Any]]:
    """Simple GET from Supabase REST API."""
    url = f"{BASE_URL}/{table}"
    resp = requests.get(url, headers=_headers(), params=params or {})
    resp.raise_for_status()
    return resp.json()


def sb_insert(
    table: str,
    payload: Dict[str, Any] | List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Insert row(s) and return inserted data."""
    url = f"{BASE_URL}/{table}"
    resp = requests.post(
        url,
        headers=_headers("return=representation"),
        json=payload,
    )
    try:
        resp.raise_for_status()
    except requests.exceptions.HTTPError as e:
        # Log the actual error from Supabase
        print(f"[SUPABASE ERROR] {resp.status_code}: {resp.text}")
        raise
    return resp.json()


def sb_update(
    table: str,
    match: Dict[str, Any],
    payload: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """Update rows matching equality filters in `match`."""
    url = f"{BASE_URL}/{table}"
    params = {k: f"eq.{v}" for k, v in match.items()}
    resp = requests.patch(
        url,
        headers=_headers("return=representation"),
        params=params,
        json=payload,
    )
    resp.raise_for_status()
    return resp.json()


def sb_delete(table: str, match: Dict[str, Any]) -> bool:
    """Delete rows matching equality filters in `match`."""
    url = f"{BASE_URL}/{table}"
    params = {k: f"eq.{v}" for k, v in match.items()}
    resp = requests.delete(url, headers=_headers(), params=params)
    resp.raise_for_status()
    return True

