import os
import logging

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from lib.parse_event import parse_event
from lib.google_calendar import CalendarEvent

load_dotenv()  # loads environment variables from .env

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

def create_app():
    """Create a Flask app that parses text into a Google Calendar link."""
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes temporarily

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/parse-event")
    def parse_event_endpoint():
        data = request.get_json(silent=True)
        logger.info("Received /parse-event request")

        if not data or "text" not in data:
            logger.warning("Request missing 'text' field")
            return jsonify({"error": "Missing required field: text"}), 400

        user_text = data["text"]

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            logger.error("Missing OpenAI API key in environment")
            return jsonify({"error": "Server misconfigured: missing OpenAI API key"}), 500

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
