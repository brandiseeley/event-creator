import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from lib.parse_event import parse_event
from lib.google_calendar import CalendarEvent

load_dotenv()  # loads environment variables from .env

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

        if not data or "text" not in data:
            return jsonify({"error": "Missing required field: text"}), 400

        user_text = data["text"]

        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return jsonify({"error": "Server misconfigured: missing OpenAI API key"}), 500

        try:
            # Parse the event from text
            event_info = parse_event(user_text, api_key)

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

            return jsonify({"calendar_link": event.link})

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(debug=True, port=5001)
