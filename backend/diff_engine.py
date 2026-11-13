"""Deterministic paragraph-level document comparison."""

from __future__ import annotations

from difflib import SequenceMatcher
from typing import TypedDict


class Paragraph(TypedDict):
    page: int
    paragraph: int
    text: str


class Change(TypedDict):
    change_type: str
    page: int
    paragraph: int
    old_text: str
    new_text: str


def compare_paragraphs(
    old_paragraphs: list[Paragraph], new_paragraphs: list[Paragraph]
) -> list[Change]:
    """Return only changed paragraphs, preserving document order."""
    old_texts = [item["text"] for item in old_paragraphs]
    new_texts = [item["text"] for item in new_paragraphs]
    matcher = SequenceMatcher(a=old_texts, b=new_texts, autojunk=False)
    changes: list[Change] = []

    for operation, old_start, old_end, new_start, new_end in matcher.get_opcodes():
        if operation == "equal":
            continue

        old_count = old_end - old_start
        new_count = new_end - new_start
        paired_count = min(old_count, new_count)

        for offset in range(paired_count):
            old_item = old_paragraphs[old_start + offset]
            new_item = new_paragraphs[new_start + offset]
            changes.append(
                {
                    "change_type": "modified",
                    "page": new_item["page"],
                    "paragraph": new_item["paragraph"],
                    "old_text": old_item["text"],
                    "new_text": new_item["text"],
                }
            )
        for index in range(old_start + paired_count, old_end):
            old_item = old_paragraphs[index]
            changes.append(
                {
                    "change_type": "deleted",
                    "page": old_item["page"],
                    "paragraph": old_item["paragraph"],
                    "old_text": old_item["text"],
                    "new_text": "",
                }
            )
        for index in range(new_start + paired_count, new_end):
            new_item = new_paragraphs[index]
            changes.append(
                {
                    "change_type": "added",
                    "page": new_item["page"],
                    "paragraph": new_item["paragraph"],
                    "old_text": "",
                    "new_text": new_item["text"],
                }
            )

    return changes
