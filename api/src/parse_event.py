"""
This module contains the logic for parsing event information
from unstructured text using OpenAI's GPT-4o model.
"""

import json
from datetime import datetime, timezone
import re

import openai

CURRENT_DATE = datetime.now(timezone.utc).strftime("%Y-%m-%d")

SYSTEM_MESSAGE = f"""
You are an expert at structured data extraction. Extract event information from unstructured text.

Extract the event start and end times. 

Return all dates as YYYY-MM-DD and times as HH:MM in 24-hour format.
If you cannot determine an exact value, return null.

If no year is specified in the text, use the current date to infer the correct year.
Today's date is {CURRENT_DATE}.
If a state, city, or region is mentioned, convert it to the correct IANA time zone. 
For example:
- "Wyoming" → "America/Denver"
- "New York" → "America/New_York"
- "Los Angeles" → "America/Los_Angeles"
If no information is present, return null for the timezone.
"""

time_zones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Asia/Tokyo',
]

calendar_event_json_schema = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "startDate": {"type": "string"},
        "startTime": {"type": "string"},
        "endDate": {"type": ["string", "null"]},
        "endTime": {"type": ["string", "null"]},
        "timeZone": {"type": ["string", "null"], "enum": time_zones + [None]},
        "location": {"type": ["string", "null"]},
    },
    "required": [
        "title",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "timeZone",
        "location",
    ],
    "additionalProperties": False,
}


def _is_valid_date(date_string, nullable=False):
    """Ensure the date string is in the format YYYY-MM-DD."""
    if nullable and date_string is None:
        return True
    return bool(re.match(r"^\d{4}-\d{2}-\d{2}$", str(date_string)))


def _is_valid_time(time_string, nullable=False):
    """Ensure the time string is in the format HH:MM."""
    if nullable and time_string is None:
        return True
    return bool(re.match(r"^\d{2}:\d{2}$", str(time_string)))


def _extract_event_info(text: str, api_key: str):
    """Extract event information from unstructured text using OpenAI's GPT-4o model."""
    openai.api_key = api_key

    response = openai.responses.create(
        model="gpt-4o-2024-08-06",
        input=[
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": text},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "event_extraction",
                "schema": calendar_event_json_schema,
                "strict": True,
            }
        },
    )

    try:
        content_text = response.output[0].content[0].text
        return json.loads(content_text)
    except (IndexError, KeyError, json.JSONDecodeError) as exc:
        raise ValueError("Failed to parse event data from API response.") from exc


def _validate_event_format(event_info):
    """
    Validate that a calendar event dictionary has the correct structure and values.

    Checks include:
    - event_info is a dictionary
    - title is non-empty
    - startDate and startTime are valid
    - endDate and endTime are valid or None
    - timeZone and location are either valid strings or None (not empty strings)

    Raises:
        ValueError: If any validation fails.
    """
    if not isinstance(event_info, dict):
        raise ValueError("Event info is not a dictionary.")

    if not event_info.get("title"):
        raise ValueError("Event title is empty.")

    if not _is_valid_date(event_info.get("startDate")):
        raise ValueError("Event start date is invalid.")

    if not _is_valid_time(event_info.get("startTime")):
        raise ValueError("Event start time is invalid.")

    if not _is_valid_date(event_info.get("endDate"), nullable=True):
        raise ValueError("Event end date is invalid.")

    if not _is_valid_time(event_info.get("endTime"), nullable=True):
        raise ValueError("Event end time is invalid.")

    if event_info.get("timeZone") == "":
        raise ValueError("Unknown time zone should be `None`, not empty string.")

    if event_info.get("location") == "":
        raise ValueError("Unknown location should be `None`, not empty string.")


def parse_event(text: str, api_key: str):
    """Parse event information from unstructured text."""
    event_info = _extract_event_info(text, api_key)
    _validate_event_format(event_info)
    return event_info
