import os
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from redis import RedisError

from src.parse_event import parse_event
from src.google_calendar import CalendarEvent
from src.redis_client import redis_client

load_dotenv()  # loads environment variables from .env

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

RATE_LIMIT_MAX = 2
RATE_LIMIT_WINDOW = 180

def validate_request(req):
    """
    Check that request contains UUID header and 'text' field.

    Returns:
        tuple: (error_present, error_message, client_uuid, text)
            error_present (bool): True if request is invalid.
            error_message (str or None): Error description if invalid.
            client_uuid (str or None): UUID from header if valid.
            text (str or None): 'text' field from JSON body if valid.
    """
    client_uuid = req.headers.get("X-Client-UUID")
    if not client_uuid:
        return True, "Missing required header: X-Client-UUID", None, None

    data = req.get_json(silent=True)
    if not data or "text" not in data:
        return True, "Missing required field: text", None, None

    return False, None, client_uuid, data["text"]


def get_api_key():
    """Fetch API key from environment."""
    return os.environ.get("OPENAI_API_KEY")


def check_rate_limit(client_uuid):
    """
    Determine if a client is within the rate limit.

    Returns:
        tuple: (allowed, retry_after)
            allowed (bool): True if request is allowed, False if limit exceeded.
            retry_after (int or None): Seconds until next allowed request,
                                       or None if allowed / Redis unavailable.
    """
    key = f"ratelimit:{client_uuid}:parse-event"
    try:
        count = redis_client.incr(key)
        if count == 1:
            redis_client.expire(key, RATE_LIMIT_WINDOW)

        if count > RATE_LIMIT_MAX:
            ttl = redis_client.ttl(key)
            return False, ttl
    except RedisError as e:
        logger.error("Redis error during rate limiting: %s", e)
        # Fail open
        return True, None

    return True, None


def create_app():
    """Create a Flask app that parses text into a Google Calendar link."""
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes temporarily

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/parse-event")
    def parse_event_endpoint():
        logger.info("Received /parse-event request")

        # Validate request format.
        error, error_message, client_uuid, user_text = validate_request(request)
        if error:
            logger.error(error_message)
            return jsonify({"error": error_message}), 400

        # Fetch API key.
        api_key = get_api_key()
        if not api_key:
            logger.error("Missing OpenAI API key in environment")
            return jsonify({"error": "Server misconfigured: missing OpenAI API key"}), 500

        # Enforce rate limiting.
        allowed, retry_after = check_rate_limit(client_uuid)
        if not allowed:
            return jsonify({"error": "Rate limit exceeded", "retry_after_seconds": retry_after}), 429

        # Create event.
        try:
            # Parse the event from text
            logger.info("Parsing event text via OpenAI API: %s", user_text)
            event_info = parse_event(user_text, api_key)
            logger.info("Event parsed successfully: %s", event_info)

            # Build the Google Calendar link
            event = CalendarEvent(
                title=event_info["title"],
                start_date=event_info["startDate"],
                start_time=event_info["startTime"],
                end_date=event_info.get("endDate"),
                end_time=event_info.get("endTime"),
                time_zone=event_info.get("timeZone"),
                location=event_info.get("location"),
            )

            logger.info("Generated Google Calendar link: %s", event.link)
            return jsonify({"calendar_link": event.link})

        except ValueError as e:
            logger.warning("Validation error: %s", e)
            return jsonify({"error": str(e)}), 400
        except Exception:
            logger.exception("Unexpected error while processing /parse-event")
            return jsonify({"error": "Unexpected error occurred"}), 500


    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(debug=True, port=5001)
