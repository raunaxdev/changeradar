"""ChangeRadar FastAPI application."""

from __future__ import annotations

import logging
import time
from email import policy
from email.parser import BytesParser

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from ai_analyzer import analyze_changes
from diff_engine import Change, compare_paragraphs
from extractor import DocumentValidationError, MAX_FILE_SIZE, extract_paragraphs

logger = logging.getLogger("changeradar")
MAX_REQUEST_SIZE = 2 * MAX_FILE_SIZE + 1024 * 1024

app = FastAPI(title="ChangeRadar API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)


async def _read_multipart_in_memory(request: Request) -> dict[str, tuple[str, bytes]]:
    content_type = request.headers.get("content-type", "")
    if not content_type.lower().startswith("multipart/form-data;"):
        raise HTTPException(status_code=400, detail="Expected multipart/form-data.")

    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > MAX_REQUEST_SIZE:
            raise HTTPException(status_code=413, detail="Request exceeds the size limit.")

    try:
        headers = (
            f"Content-Type: {content_type}\r\n"
            "MIME-Version: 1.0\r\n\r\n"
        ).encode("ascii", errors="strict")
    except UnicodeEncodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid multipart content type.") from exc
    message = BytesParser(policy=policy.default).parsebytes(headers + bytes(body))
    if not message.is_multipart():
        raise HTTPException(status_code=400, detail="Malformed multipart request.")

    files: dict[str, tuple[str, bytes]] = {}
    for part in message.iter_parts():
        if part.get_content_disposition() != "form-data":
            continue
        field_name = part.get_param("name", header="content-disposition")
        filename = part.get_filename()
        if field_name not in {"old_file", "new_file"} or filename is None:
            continue
        if field_name in files:
            raise HTTPException(status_code=400, detail=f"Duplicate {field_name} field.")
        content = part.get_payload(decode=True)
        if content is None:
            raise HTTPException(status_code=400, detail=f"Invalid {field_name} upload.")
        files[field_name] = (filename, content)

    if set(files) != {"old_file", "new_file"}:
        raise HTTPException(
            status_code=400,
            detail="Both old_file and new_file uploads are required.",
        )
    return files


@app.post("/api/compare")
async def compare_documents(request: Request) -> dict[str, object]:
    started_at = time.perf_counter()
    status = "error"
    try:
        files = await _read_multipart_in_memory(request)
        try:
            old_filename, old_data = files["old_file"]
            new_filename, new_data = files["new_file"]
            old_paragraphs = await run_in_threadpool(
                extract_paragraphs, old_filename, old_data
            )
            new_paragraphs = await run_in_threadpool(
                extract_paragraphs, new_filename, new_data
            )
        except DocumentValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

        changes: list[Change] = compare_paragraphs(old_paragraphs, new_paragraphs)
        try:
            analysis = await run_in_threadpool(analyze_changes, changes)
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail="Document analysis failed. Check the API configuration and retry.",
            ) from exc
        status = "success"
        return {"changes": changes, **analysis}
    finally:
        duration_ms = (time.perf_counter() - started_at) * 1000
        logger.info("compare status=%s duration_ms=%.2f", status, duration_ms)
