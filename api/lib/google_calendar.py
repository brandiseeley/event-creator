"""
This module contains the logic for creating a Google
Calendar event URL from event information.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from urllib.parse import urlencode


class CalendarEvent:
    """Represent a calendar event and generate a Google Calendar URL."""

    def __init__(
        self,
        title: str,
        start_date: str,
        start_time: str,
        end_date: str | None = None,
        end_time: str | None = None,
        time_zone: str | None = None,
        location: str | None = None,
    ) -> None:
        # Original strings
        self.title: str = title
        self.start_date_str: str = start_date
        self.start_time_str: str = start_time
        self.end_date_str: str | None = end_date
        self.end_time_str: str | None = end_time
        self.time_zone: str | None = time_zone
        self.location: str | None = location

        # Parsed datetime objects
        self.start_datetime: datetime = self._parse_datetime(
            self.start_date_str, self.start_time_str
        )
        self.end_datetime: datetime = self._build_end_datetime()

    @property
    def link(self) -> str:
        """Return a Google Calendar event creation URL."""
        base_url = "https://calendar.google.com/calendar/u/0/r/eventedit"

        params = {
            "text": self.title,
            "ctz": self.time_zone,
            "dates": f"{self._format_for_calendar(self.start_datetime)}/"
                     f"{self._format_for_calendar(self.end_datetime)}",
            "location": self.location or "",
        }

        return f"{base_url}?{urlencode(params)}"

    @staticmethod
    def _parse_datetime(date_str: str, time_str: str) -> datetime:
        """Parse YYYY-MM-DD and HH:MM into a datetime object."""
        return datetime.fromisoformat(f"{date_str}T{time_str}")

    def _build_end_datetime(self) -> datetime:
        """Return the end datetime or default to one hour after start."""
        if self.end_date_str and self.end_time_str:
            return self._parse_datetime(self.end_date_str, self.end_time_str)
        return self.start_datetime + timedelta(hours=1)

    @staticmethod
    def _format_for_calendar(dt: datetime) -> str:
        """Format datetime as YYYYMMDDTHHMMSS (no timezone suffix)."""
        return dt.strftime("%Y%m%dT%H%M%S")


if __name__ == "__main__":
    # Example usage
    event = CalendarEvent(
        title="LS Women's Group | Fundamentals at Work",
        start_date="2025-12-21",
        start_time="14:00",
        end_date=None,
        end_time=None,
        time_zone="America/New_York",
        location="Gathertown",
    )

    print(event.link)

    EXPECTED_URL = (
        "https://calendar.google.com/calendar/u/0/r/eventedit"
        "?text=LS+Women%27s+Group+%7C+Fundamentals+at+Work"
        "&ctz=America%2FNew_York"
        "&dates=20251221T140000%2F20251221T150000"
        "&location=Gathertown"
    )

    print("Passing:", event.link == EXPECTED_URL)
