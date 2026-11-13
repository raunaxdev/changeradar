"""In-memory text extraction for PDF and DOCX documents."""

from __future__ import annotations

from io import BytesIO
from pathlib import PurePath
from zipfile import BadZipFile, ZipFile

import pymupdf as fitz
from docx import Document

MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_DOCX_UNCOMPRESSED_SIZE = 50 * 1024 * 1024


class DocumentValidationError(ValueError):
    """Raised when an uploaded document is invalid or unsupported."""


def _extract_pdf(data: bytes) -> list[dict[str, int | str]]:
    try:
        pdf = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise DocumentValidationError("Invalid PDF document.") from exc

    paragraphs: list[dict[str, int | str]] = []
    try:
        for page_number, page in enumerate(pdf, start=1):
            page_paragraph = 0
            for block in page.get_text("blocks", sort=True):
                text = " ".join(block[4].split())
                if text:
                    page_paragraph += 1
                    paragraphs.append(
                        {
                            "page": page_number,
                            "paragraph": page_paragraph,
                            "text": text,
                        }
                    )
    finally:
        pdf.close()
    return paragraphs


def _extract_docx(data: bytes) -> list[dict[str, int | str]]:
    try:
        with ZipFile(BytesIO(data)) as archive:
            names = set(archive.namelist())
            if (
                "[Content_Types].xml" not in names
                or "word/document.xml" not in names
                or sum(item.file_size for item in archive.infolist())
                > MAX_DOCX_UNCOMPRESSED_SIZE
            ):
                raise DocumentValidationError("Invalid or oversized DOCX document.")
        document = Document(BytesIO(data))
    except DocumentValidationError:
        raise
    except (BadZipFile, KeyError, ValueError, OSError) as exc:
        raise DocumentValidationError("Invalid DOCX document.") from exc
    except Exception as exc:
        raise DocumentValidationError("Invalid DOCX document.") from exc

    # DOCX stores paragraph flow, not rendered page locations; page is 1.
    return [
        {"page": 1, "paragraph": index, "text": paragraph.text.strip()}
        for index, paragraph in enumerate(document.paragraphs, start=1)
        if paragraph.text.strip()
    ]


def extract_paragraphs(filename: str, data: bytes) -> list[dict[str, int | str]]:
    """Validate a PDF/DOCX byte stream and return its non-empty paragraphs."""
    if len(data) > MAX_FILE_SIZE:
        raise DocumentValidationError("File exceeds the 10 MB limit.")
    if not data:
        raise DocumentValidationError("The uploaded file is empty.")

    extension = PurePath(filename).suffix.lower()
    if extension == ".pdf":
        if not data.startswith(b"%PDF-"):
            raise DocumentValidationError("File content does not match a PDF.")
        return _extract_pdf(data)
    if extension == ".docx":
        if not data.startswith(b"PK\x03\x04"):
            raise DocumentValidationError("File content does not match a DOCX.")
        return _extract_docx(data)
    raise DocumentValidationError("Only PDF and DOCX files are supported.")
