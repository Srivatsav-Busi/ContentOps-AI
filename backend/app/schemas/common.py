"""Common response schemas matching the Next.js API envelope."""

from typing import Any
from pydantic import BaseModel


class ErrorItem(BaseModel):
    code: str
    message: str


class ApiResponse(BaseModel):
    data: Any = None
    meta: Any = None
    errors: list[ErrorItem] | None = None


def json_response(data: Any, meta: Any = None) -> dict:
    return {"data": data, "meta": meta, "errors": None}


def paginated_response(data: list, cursor: str | None = None, has_more: bool = False, total: int | None = None) -> dict:
    return {
        "data": data,
        "meta": {"cursor": cursor, "hasMore": has_more, "total": total},
        "errors": None,
    }


def error_body(message: str, code: str = "ERR_400") -> dict:
    return {"data": None, "meta": None, "errors": [{"code": code, "message": message}]}
