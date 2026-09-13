"""
Import StrengthLog exercises CSV into the Supabase `exercises` table.

Setup:
    pip install supabase python-dotenv

    Create a .env file next to this script (or set env vars directly):
        SUPABASE_URL=https://your-project.supabase.co
        SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

    (Use the SERVICE ROLE key, not the anon key -- this is a server-side
    bulk write and the service role key must never ship in the app.)

    Run create_exercises_table.sql in the Supabase SQL editor first.

Usage:
    python import_exercises.py [path_to_csv]

    Defaults to strengthlog_exercises.csv in the same folder if no path
    is given.

Behavior:
    Upserts by `name` (unique constraint) -- re-running this script after
    updating the CSV will overwrite existing rows and bump updated_at,
    rather than creating duplicates.
"""

import csv
import os
import sys
import re
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BATCH_SIZE = 50


def parse_instructions(raw: str) -> list[str]:
    """
    Turn 'How to Do' text like:
        "1. Do this. 2. Do that. 3. Finish up."
    into ["Do this.", "Do that.", "Finish up."]

    Splits on the numbered-step pattern (e.g. " 2. ", " 3. ") while
    keeping step 1's text intact.
    """
    raw = (raw or "").strip()
    if not raw:
        return []

    parts = re.split(r"(?:(?<=\.)|(?<=^))\s*\d+\.\s+", raw)
    steps = [p.strip() for p in parts if p.strip()]
    return steps


def parse_muscle_list(raw: str) -> list[str]:
    """'Chest; Front Deltoid; Triceps' -> ['Chest', 'Front Deltoid', 'Triceps']"""
    raw = (raw or "").strip()
    if not raw:
        return []
    return [m.strip() for m in raw.split(";") if m.strip()]


def load_rows(csv_path: str) -> list[dict]:
    rows = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("Exercise Name", "").strip()
            if not name:
                continue
            rows.append({
                "name": name,
                "category": row.get("Category", "").strip(),
                "source_url": row.get("URL", "").strip() or None,
                "instructions": parse_instructions(row.get("How to Do", "")),
                "primary_muscles": parse_muscle_list(row.get("Primary Muscles Worked", "")),
                "secondary_muscles": parse_muscle_list(row.get("Secondary Muscles Worked", "")),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
    return rows


def chunk(lst: list, size: int):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY "
              "(env vars or .env file) before running.")
        sys.exit(1)

    csv_path = sys.argv[1] if len(sys.argv) > 1 else "strengthlog_exercises.csv"
    if not os.path.exists(csv_path):
        print(f"ERROR: CSV not found at {csv_path}")
        sys.exit(1)

    print(f"Reading {csv_path}...")
    rows = load_rows(csv_path)
    print(f"Loaded {len(rows)} exercises.\n")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    failed = []
    total_batches = (len(rows) + BATCH_SIZE - 1) // BATCH_SIZE

    for i, batch in enumerate(chunk(rows, BATCH_SIZE), 1):
        print(f"Upserting batch {i}/{total_batches} ({len(batch)} rows)...")
        try:
            supabase.table("exercises").upsert(
                batch, on_conflict="name"
            ).execute()
        except Exception as e:
            print(f"  Batch {i} failed: {e}")
            failed.extend(row["name"] for row in batch)

    print("\nDone.")
    print(f"  Upserted: {len(rows) - len(failed)}")
    if failed:
        print(f"  Failed:   {len(failed)}")
        for name in failed:
            print(f"    - {name}")
    else:
        print("  Failed:   0")


if __name__ == "__main__":
    main()
