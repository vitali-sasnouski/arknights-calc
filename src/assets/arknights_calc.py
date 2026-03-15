#!/usr/bin/env python3
"""
Arknights — Orundum and HH Permit Calculator
"""

import os
import sys
from datetime import datetime

# ── Windows locale helpers ────────────────────────────────────────────────────

def get_windows_date_format() -> str:
    """
    Read the short date format from Windows regional settings via the registry.
    Returns a strptime-compatible format string.
    Falls back to '%d.%m.%Y' if the value cannot be read.
    """
    FALLBACK = "%d.%m.%Y"

    try:
        import winreg
        key_path = r"Control Panel\International"
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path) as key:
            win_fmt, _ = winreg.QueryValueEx(key, "sShortDate")
    except Exception:
        return FALLBACK

    # Convert Windows picture format → Python strptime format
    # Windows uses d/dd/M/MM/yy/yyyy tokens (case-sensitive)
    replacements = [
        ("yyyy", "%Y"),
        ("yy",   "%y"),
        ("dd",   "%d"),
        ("d",    "%d"),
        ("MM",   "%m"),
        ("M",    "%m"),
    ]
    fmt = win_fmt
    for win_token, py_token in replacements:
        fmt = fmt.replace(win_token, py_token)

    return fmt


# Resolved once at import time
DATE_FORMAT: str = get_windows_date_format()
FORMAT_EXAMPLE: str = datetime(2025, 1, 25).strftime(DATE_FORMAT)  # e.g. 25.01.2025


# ── Date parsing ──────────────────────────────────────────────────────────────

def parse_date(date_str: str) -> datetime:
    """Parse a date string using the OS-resolved format."""
    try:
        return datetime.strptime(date_str, DATE_FORMAT)
    except ValueError:
        raise ValueError(
            f"Invalid date format: '{date_str}'\n"
            f"  Please enter the date in the following format: {FORMAT_EXAMPLE}"
        )


# ── Usage / help ──────────────────────────────────────────────────────────────

def print_usage():
    print(
        "╔══════════════════════════════════════════════════════════════╗\n"
        "║    Arknights — Orundum and HH Permit Calculator             ║\n"
        "╚══════════════════════════════════════════════════════════════╝\n"
        "\n"
        "This script calculates Orundum and HH Permit in Arknights\n"
        "for a given date range.\n"
        "\n"
        "Usage:\n"
        "  python arknights_calc.py                      (interactive mode)\n"
        "  python arknights_calc.py <date_start> <date_end>\n"
        "\n"
        "Parameters:\n"
        "  date_start   Start date of the period (inclusive).\n"
        "  date_end     End date of the period (inclusive).\n"
        "\n"
        "  If no parameters are provided, the script will prompt you\n"
        "  to enter each date separately.\n"
        "\n"
        f"Date format (from your Windows regional settings): {FORMAT_EXAMPLE}\n"
        "\n"
        "Examples:\n"
        f"  python arknights_calc.py {datetime(2025, 1, 1).strftime(DATE_FORMAT)} "
        f"{datetime(2025, 1, 31).strftime(DATE_FORMAT)}\n"
    )


# ── Core calculation ──────────────────────────────────────────────────────────

ORUNDUM_PER_DAY      = 300   # daily base
ORUNDUM_MONDAY       = 1800  # every Monday
ORUNDUM_WEDNESDAY    = 500   # every Wednesday
ORUNDUM_MONTH_FIRST  = 600   # first day of each month


HH_MONTH_FIRST = 4    # first day of each month
HH_DAY_17      = 1    # 17th of each month
ORUNDUM_PER_HH = 600  # Orundum cost of 1 HH Permit


def calculate_hh_permit(date_start: datetime, date_end: datetime) -> dict:
    """
    Calculate HH Permits earned between date_start and date_end (both inclusive).
    Returns a breakdown dict with individual bonus totals and the grand total.
    """
    from datetime import timedelta

    total_month_firsts   = 0
    total_day_seventeenths = 0

    current = date_start
    while current <= date_end:
        if current.day == 1:
            total_month_firsts += 1
        if current.day == 17:
            total_day_seventeenths += 1
        current += timedelta(days=1)

    month_first_total = total_month_firsts   * HH_MONTH_FIRST
    day_17_total      = total_day_seventeenths * HH_DAY_17
    grand_total       = month_first_total + day_17_total

    return {
        "month_firsts":      total_month_firsts,
        "day_seventeenths":  total_day_seventeenths,
        "month_first_total": month_first_total,
        "day_17_total":      day_17_total,
        "grand_total":       grand_total,
    }


def calculate_orundum(date_start: datetime, date_end: datetime) -> dict:
    """
    Calculate Orundum earned between date_start and date_end (both inclusive).
    Returns a breakdown dict with individual bonus totals and the grand total.
    """
    from datetime import timedelta

    total_days         = 0
    total_mondays      = 0
    total_wednesdays   = 0
    total_month_firsts = 0

    current = date_start
    while current <= date_end:
        total_days += 1
        if current.weekday() == 0:  # Monday
            total_mondays += 1
        if current.weekday() == 2:  # Wednesday
            total_wednesdays += 1
        if current.day == 1:        # First of month
            total_month_firsts += 1
        current += timedelta(days=1)

    daily_total       = total_days         * ORUNDUM_PER_DAY
    monday_total      = total_mondays      * ORUNDUM_MONDAY
    wednesday_total   = total_wednesdays   * ORUNDUM_WEDNESDAY
    month_first_total = total_month_firsts * ORUNDUM_MONTH_FIRST
    grand_total       = daily_total + monday_total + wednesday_total + month_first_total

    return {
        "days":              total_days,
        "mondays":           total_mondays,
        "wednesdays":        total_wednesdays,
        "month_firsts":      total_month_firsts,
        "daily_total":       daily_total,
        "monday_total":      monday_total,
        "wednesday_total":   wednesday_total,
        "month_first_total": month_first_total,
        "grand_total":       grand_total,
    }


def calculate(date_start: datetime, date_end: datetime):
    """Calculate and print Orundum and HH Permit for the given period."""
    if (date_end - date_start).days < 0:
        raise ValueError(
            f"date_start ({date_start.strftime(DATE_FORMAT)}) must be "
            f"before date_end ({date_end.strftime(DATE_FORMAT)})."
        )

    print("Arknights — Orundum and HH Permit Calculator\n")
    print(f"  Period : {date_start.strftime(DATE_FORMAT)} → {date_end.strftime(DATE_FORMAT)}")
    print()

    # ── Orundum ──────────────────────────────────────────────────────────────
    o = calculate_orundum(date_start, date_end)

    print("  ┌─ Orundum ───────────────────────────────────────────────────┐")
    print(f"  │  Daily base   : {o['days']:>4} day(s)  × {ORUNDUM_PER_DAY:>5}  = {o['daily_total']:>8,}  │")
    print(f"  │  Monday bonus : {o['mondays']:>4} day(s)  × {ORUNDUM_MONDAY:>5}  = {o['monday_total']:>8,}  │")
    print(f"  │  Wednesday    : {o['wednesdays']:>4} day(s)  × {ORUNDUM_WEDNESDAY:>5}  = {o['wednesday_total']:>8,}  │")
    print(f"  │  Month start  : {o['month_firsts']:>4} day(s)  × {ORUNDUM_MONTH_FIRST:>5}  = {o['month_first_total']:>8,}  │")
    print( "  │  ─────────────────────────────────────────────────────────  │")
    print(f"  │  Total Orundum                             = {o['grand_total']:>8,}  │")
    print( "  └─────────────────────────────────────────────────────────────┘")
    print()

    # ── HH Permit ────────────────────────────────────────────────────────────
    h = calculate_hh_permit(date_start, date_end)

    hh_from_orundum = o['grand_total'] // ORUNDUM_PER_HH
    hh_total        = h['grand_total'] + hh_from_orundum

    print("  ┌─ HH Permit ─────────────────────────────────────────────────┐")
    print(f"  │  Month start  : {h['month_firsts']:>4} day(s)  × {HH_MONTH_FIRST:>5}  = {h['month_first_total']:>8,}  │")
    print(f"  │  Day 17 bonus : {h['day_seventeenths']:>4} day(s)  × {HH_DAY_17:>5}  = {h['day_17_total']:>8,}  │")
    print( "  │  ─────────────────────────────────────────────────────────  │")
    print(f"  │  HH from period                            = {h['grand_total']:>8,}  │")
    print( "  │                                                             │")
    print(f"  │  Orundum → HH : {o['grand_total']:,} ÷ {ORUNDUM_PER_HH} = {o['grand_total'] / ORUNDUM_PER_HH:.1f} → {hh_from_orundum:,}  │")
    print( "  │  ─────────────────────────────────────────────────────────  │")
    print(f"  │  Total HH Permit                           = {hh_total:>8,}  │")
    print( "  └─────────────────────────────────────────────────────────────┘")


# ── Entry point ───────────────────────────────────────────────────────────────

def prompt_date(prompt_label: str) -> datetime:
    """Prompt the user to enter a date interactively, repeating on invalid input."""
    while True:
        raw = input(f"Enter {prompt_label} date in format {FORMAT_EXAMPLE}: ").strip()
        try:
            return parse_date(raw)
        except ValueError as e:
            print(f"  ✗ {e}\n")


def main():
    if len(sys.argv) == 1:
        # No arguments — show info then prompt interactively
        print_usage()
        print()
        date_start = prompt_date("start")
        date_end   = prompt_date("end")

    elif len(sys.argv) == 3:
        # Both dates passed as arguments
        _, raw_start, raw_end = sys.argv
        errors = []

        try:
            date_start = parse_date(raw_start)
        except ValueError as e:
            errors.append(f"date_start — {e}")
            date_start = None

        try:
            date_end = parse_date(raw_end)
        except ValueError as e:
            errors.append(f"date_end   — {e}")
            date_end = None

        if errors:
            print("The following input error(s) occurred:\n")
            for err in errors:
                print(f"  ✗ {err}")
            print()
            sys.exit(1)

    else:
        print(
            "Error: Expected exactly 2 arguments (date_start and date_end).\n"
            "Run the script without arguments to see usage information and enter dates interactively.\n"
        )
        sys.exit(1)

    print()
    try:
        calculate(date_start, date_end)
    except ValueError as e:
        print(f"Error: {e}")
    finally:
        print()
        os.system("pause")


if __name__ == "__main__":
    main()