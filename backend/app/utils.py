"""Shared utility functions."""

from pathlib import Path
from app.config import settings


def storage_key_to_abs_path(storage_key: str) -> Path:
    """Convert a relative storage key to an absolute path under the data dir."""
    return settings.project_root / "data" / storage_key
