#!/usr/bin/env python3
"""
Clean hackerrank_challenges.csv into import-ready JSON for CodeMehfil questions.

The scraped `body` field is truncated (~500 chars) and mostly MathJax CSS — not
usable as problem statements. We keep metadata + preview + official URL for a
link-out / curated catalog (legal-safe: no full problem republish).

Usage:
  python3 scripts/clean_hackerrank_csv.py \\
    --input hackerrank_challenges.csv \\
    --output data/hackerrank_challenges.clean.json

  # optional quality filters
  python3 scripts/clean_hackerrank_csv.py --min-preview-len 20 --max-difficulty hard
"""

from __future__ import annotations

import argparse
import ast
import csv
import json
import re
import sys
from pathlib import Path
from typing import Any


DIFFICULTY_MAP = {
    "easy": "easy",
    "medium": "medium",
    "hard": "hard",
    "advanced": "hard",
    "expert": "hard",
}

CATEGORY_MAP = {
    "algorithms": "algorithms",
    "data structures": "data_structures",
    "data-structures": "data_structures",
    "mathematics": "algorithms",
    "python": "other",
    "java": "other",
    "sql": "database",
    "c++": "other",
    "cpp": "other",
    "c": "other",
}

LANG_NORMALIZE = {
    "python3": "python",
    "python2": "python",
    "py": "python",
    "js": "javascript",
    "nodejs": "javascript",
    "node": "javascript",
    "ts": "typescript",
    "c++": "cpp",
    "cpp14": "cpp",
    "cpp20": "cpp",
    "csharp": "csharp",
    "golang": "go",
}


def parse_listish(raw: str) -> list[str]:
    raw = (raw or "").strip()
    if not raw:
        return []
    try:
        val = ast.literal_eval(raw)
        if isinstance(val, (list, tuple)):
            return [str(x).strip() for x in val if str(x).strip()]
    except (SyntaxError, ValueError):
        pass
    return [p.strip().strip("'\"") for p in re.split(r"[,|]", raw) if p.strip()]


def normalize_difficulty(raw: str) -> str:
    return DIFFICULTY_MAP.get((raw or "").strip().lower(), "medium")


def normalize_category(track: str, category: str) -> str:
    for key in ((track or "").strip().lower(), (category or "").strip().lower()):
        if key in CATEGORY_MAP:
            return CATEGORY_MAP[key]
    return "other"


def normalize_languages(raw: str) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for lang in parse_listish(raw):
        key = LANG_NORMALIZE.get(lang.lower(), lang.lower())
        key = re.sub(r"[^a-z0-9+#]+", "", key)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def clean_preview(preview: str, name: str) -> str:
    text = re.sub(r"\s+", " ", (preview or "").strip())
    if len(text) >= 12:
        return text
    return f"Practice challenge: {name}. Open on HackerRank for the full statement and samples."


def build_description(row: dict[str, str], preview: str) -> str:
    tags = parse_listish(row.get("tags", ""))
    tag_line = ", ".join(tags[:8]) if tags else "general"
    stats = []
    if row.get("maxScore"):
        stats.append(f"Max score: {row['maxScore']}")
    if row.get("successRatio"):
        try:
            ratio = float(row["successRatio"])
            stats.append(f"Success ratio: {ratio:.0%}")
        except ValueError:
            pass
    if row.get("solvedCount"):
        stats.append(f"Solved: {row['solvedCount']}")

    lines = [
        preview,
        "",
        f"Track: {row.get('track') or row.get('category') or 'general'}",
        f"Tags: {tag_line}",
    ]
    if stats:
        lines.append("Stats: " + " · ".join(stats))
    lines.extend(
        [
            "",
            "Full problem statement, constraints, and official samples are on HackerRank.",
            f"Open: {row.get('url', '').strip()}",
            "",
            "Use this card to pick a challenge during an interview, then solve together in the shared editor.",
        ]
    )
    return "\n".join(lines).strip()


def default_starter_code(languages: list[str]) -> dict[str, str]:
    snippets = {
        "python": "# Solve the HackerRank challenge here\n# Read input from stdin if needed\n\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()\n",
        "javascript": "// Solve the HackerRank challenge here\nfunction main() {\n  // ...\n}\n\nmain();\n",
        "typescript": "// Solve the HackerRank challenge here\nfunction main(): void {\n  // ...\n}\n\nmain();\n",
        "java": "public class Solution {\n  public static void main(String[] args) {\n    // Solve the HackerRank challenge here\n  }\n}\n",
        "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // Solve the HackerRank challenge here\n  return 0;\n}\n",
        "c": "#include <stdio.h>\n\nint main() {\n  // Solve the HackerRank challenge here\n  return 0;\n}\n",
        "go": "package main\n\nimport \"fmt\"\n\nfunc main() {\n  // Solve the HackerRank challenge here\n  _ = fmt.Sprintf\n}\n",
        "ruby": "# Solve the HackerRank challenge here\ndef main\nend\n\nmain\n",
        "php": "<?php\n// Solve the HackerRank challenge here\n",
        "rust": "fn main() {\n    // Solve the HackerRank challenge here\n}\n",
        "swift": "import Foundation\n// Solve the HackerRank challenge here\n",
    }
    preferred = ["python", "javascript", "java", "cpp", "typescript"]
    picked: list[str] = []
    for lang in preferred + languages:
        if lang in snippets and lang not in picked:
            picked.append(lang)
        if len(picked) >= 4:
            break
    if not picked:
        picked = ["python", "javascript"]
    return {lang: snippets[lang] for lang in picked}


def is_clean_row(row: dict[str, str], min_preview_len: int) -> tuple[bool, str]:
    name = (row.get("name") or "").strip()
    slug = (row.get("slug") or "").strip()
    url = (row.get("url") or "").strip()
    if not name:
        return False, "missing_name"
    if not slug or not re.match(r"^[a-z0-9][a-z0-9_-]*$", slug):
        return False, "bad_slug"
    if not url.startswith("https://www.hackerrank.com/challenges/"):
        return False, "bad_url"
    preview = (row.get("preview") or "").strip()
    # Allow empty preview — we synthesize description — but flag very short junk previews
    if preview and len(preview) < min_preview_len and preview.lower() in {"n/a", "null", "none", "-"}:
        return False, "junk_preview"
    # Drop rows whose "body" looks like only CSS (already truncated junk) — we don't use body,
    # but require at least a preview OR a solid name+url which we already have.
    return True, "ok"


def clean_row(row: dict[str, str]) -> dict[str, Any]:
    name = row["name"].strip()
    slug = row["slug"].strip()
    difficulty = normalize_difficulty(row.get("difficulty", ""))
    category = normalize_category(row.get("track", ""), row.get("category", ""))
    tags = parse_listish(row.get("tags", ""))
    # Deduplicate tags case-insensitively and drop difficulty duplicates
    tag_out: list[str] = []
    seen = set()
    for t in tags:
        key = t.lower()
        if key in seen or key in {"easy", "medium", "hard", "advanced", "expert"}:
            continue
        seen.add(key)
        tag_out.append(t)
    languages = normalize_languages(row.get("languages", ""))
    preview = clean_preview(row.get("preview", ""), name)
    topics = []
    track = (row.get("track") or "").strip()
    if track:
        topics.append(track.replace("-", " "))
    for t in tag_out[:6]:
        if t.lower() not in {x.lower() for x in topics}:
            topics.append(t)

    meta: dict[str, Any] = {
        "slug": slug,
        "track": track or None,
        "hackerrank_category": (row.get("category") or "").strip() or None,
        "original_difficulty": (row.get("difficulty") or "").strip() or None,
        "max_score": _to_number(row.get("maxScore")),
        "success_ratio": _to_float(row.get("successRatio")),
        "total_submissions": _to_number(row.get("totalSubmissions")),
        "solved_count": _to_number(row.get("solvedCount")),
        "languages": languages,
        "scraped_at": (row.get("scrapedAt") or "").strip() or None,
    }

    return {
        "external_id": slug,
        "source": "hackerrank",
        "title": name,
        "description": build_description(row, preview),
        "difficulty": difficulty,
        "category": category,
        "topics": topics,
        "tags": tag_out[:12],
        "external_url": row["url"].strip(),
        "preview": preview,
        "starter_code": default_starter_code(languages),
        "time_limit_minutes": 45 if difficulty == "easy" else 60 if difficulty == "medium" else 90,
        "source_metadata": meta,
    }


def _to_number(raw: str | None) -> int | None:
    if raw is None or str(raw).strip() == "":
        return None
    try:
        return int(float(str(raw).replace(",", "")))
    except ValueError:
        return None


def _to_float(raw: str | None) -> float | None:
    if raw is None or str(raw).strip() == "":
        return None
    try:
        return float(str(raw))
    except ValueError:
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Clean HackerRank challenges CSV")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("hackerrank_challenges.csv"),
        help="Path to scraped CSV",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/hackerrank_challenges.clean.json"),
        help="Clean JSON output path",
    )
    parser.add_argument("--min-preview-len", type=int, default=0)
    parser.add_argument(
        "--max-difficulty",
        choices=["easy", "medium", "hard"],
        default=None,
        help="Keep only up to this mapped difficulty",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Optional max rows to keep after cleaning (0 = all)",
    )
    args = parser.parse_args()

    if not args.input.exists():
        print(f"Input not found: {args.input}", file=sys.stderr)
        return 1

    with args.input.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    rank = {"easy": 0, "medium": 1, "hard": 2}
    max_rank = rank[args.max_difficulty] if args.max_difficulty else 2

    cleaned: list[dict[str, Any]] = []
    rejected: dict[str, int] = {}
    seen_slugs: set[str] = set()

    for row in rows:
        ok, reason = is_clean_row(row, args.min_preview_len)
        if not ok:
            rejected[reason] = rejected.get(reason, 0) + 1
            continue
        item = clean_row(row)
        if rank[item["difficulty"]] > max_rank:
            rejected["filtered_difficulty"] = rejected.get("filtered_difficulty", 0) + 1
            continue
        if item["external_id"] in seen_slugs:
            rejected["duplicate_slug"] = rejected.get("duplicate_slug", 0) + 1
            continue
        seen_slugs.add(item["external_id"])
        cleaned.append(item)
        if args.limit and len(cleaned) >= args.limit:
            break

    # Prefer higher-quality catalog order: more solved first within difficulty
    cleaned.sort(
        key=lambda x: (
            rank[x["difficulty"]],
            -((x.get("source_metadata") or {}).get("solved_count") or 0),
            x["title"].lower(),
        )
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": "hackerrank",
        "generated_from": str(args.input),
        "count": len(cleaned),
        "rejected": rejected,
        "notes": [
            "body/editorial from scrape were not usable (truncated/CSS/False).",
            "Descriptions use preview + metadata + official URL (link-out).",
            "Import with: bundle exec rake questions:import_hackerrank",
        ],
        "challenges": cleaned,
    }
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"Read {len(rows)} rows")
    print(f"Kept {len(cleaned)} clean challenges → {args.output}")
    if rejected:
        print("Rejected:", json.dumps(rejected))
    by_diff: dict[str, int] = {}
    for c in cleaned:
        by_diff[c["difficulty"]] = by_diff.get(c["difficulty"], 0) + 1
    print("By difficulty:", by_diff)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
