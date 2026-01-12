"""
This module contains the logic for creating a Flask app
that can parse event information from unstructured text.
"""

import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from lib.parse_event import parse_event

load_dotenv()  # loads environment variables from .env

def create_app():
    """Create a Flask app that can parse event information from unstructured text."""
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes temporarily

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
            event_info = parse_event(user_text, api_key)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

        return jsonify(event_info)

    return app


if __name__ == "__main__":
    flask_app = create_app()
    flask_app.run(debug=True, port=5001)
