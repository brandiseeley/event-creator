""" Tests for the CalendarEvent class in src.google_calendar. """

from datetime import datetime, timedelta
from urllib.parse import parse_qs, urlparse

from src.google_calendar import CalendarEvent

def test_google_calendar_url_basic():
    """Check that a basic event generates the correct URL."""
    event = CalendarEvent(
        title="LS Women's Group | Fundamentals at Work",
        start_date="2025-12-21",
        start_time="14:00",
        end_date=None,
        end_time=None,
        time_zone="America/New_York",
        location="Gathertown",
    )

    url = event.link

    # Parse the query params
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    assert parsed.scheme == "https"
    assert parsed.netloc == "calendar.google.com"
    assert parsed.path == "/calendar/u/0/r/eventedit"

    # Check each parameter
    assert params["text"][0] == "LS Women's Group | Fundamentals at Work"
    assert params["ctz"][0] == "America/New_York"
    assert params["location"][0] == "Gathertown"

    # Check dates: start should match input, end should be +1h by default
    start_dt = datetime.fromisoformat("2025-12-21T14:00")
    expected_end_dt = start_dt + timedelta(hours=1)
    start_str = start_dt.strftime('%Y%m%dT%H%M%S')
    end_str = expected_end_dt.strftime('%Y%m%dT%H%M%S')
    expected_dates = f"{start_str}/{end_str}"
    assert params["dates"][0] == expected_dates

def test_google_calendar_url_with_explicit_end():
    """Check that providing end date/time overrides default +1 hour."""
    event = CalendarEvent(
        title="Test Event",
        start_date="2025-12-21",
        start_time="14:00",
        end_date="2025-12-21",
        end_time="15:30",
        time_zone="America/Los_Angeles",
        location="Zoom",
    )

    url = event.link
    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    assert params["dates"][0] == "20251221T140000/20251221T153000"
    assert params["ctz"][0] == "America/Los_Angeles"
    assert params["location"][0] == "Zoom"
    assert params["text"][0] == "Test Event"
