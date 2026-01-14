""" Tests for the event parsing logic in src.parse_event. """

import pytest

from src.parse_event import (
    _validate_event_format,
    _is_valid_date,
    _is_valid_time,
)


def test_validate_event_format_accepts_valid_event():
    """Test that valid date does not raise exception"""
    valid_event = {
        "title": "Meeting",
        "startDate": "2026-01-14",
        "startTime": "14:00",
        "endDate": "2026-01-14",
        "endTime": "15:00",
        "timeZone": "America/New_York",
        "location": "Zoom",
    }
    # Should not raise
    _validate_event_format(valid_event)


@pytest.mark.parametrize("invalid_event", [
    {},  # empty dict
    {"title": ""},  # empty title
    {"title": "X", "startDate": "2026-13-01", "startTime": "10:00"},  # invalid month
    {"title": "X", "startDate": "2026-01-01", "startTime": "25:00"},  # invalid hour
    {"title": "X",
     "startDate": "2026-01-01",
     "startTime": "10:00",
     "endDate": None,
     "endTime": "",
     "timeZone": "",
     "location": ""}, # empty strings
])
def test_validate_event_format_rejects_invalid(invalid_event):
    """
    Test that _validate_event_format raises ValueError for various invalid events.
    Uses parametrize to run the test with multiple inputs.
    """
    with pytest.raises(ValueError):
        _validate_event_format(invalid_event)


def test_is_valid_date():
    """Test that _is_valid_date rejects incorrect formats or fake dates"""
    assert _is_valid_date("2026-01-14")
    assert not _is_valid_date("2026-13-01")
    # nullable
    assert _is_valid_date(None, nullable=True)
    assert _is_valid_time(None, nullable=True)

def test_is_valid_time():
    """Test that _is_valid_time rejects incorrect formats or fake times"""
    assert _is_valid_time("14:00")
    assert not _is_valid_time("24:00")
    # nullable
    assert _is_valid_time(None, nullable=True)
