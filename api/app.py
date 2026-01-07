from flask import Flask, jsonify, request
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes temporarily

    @app.get("/health")
    def health_check():
        return jsonify({"status": "ok"})

    @app.post("/parse-event")
    def parse_event():
        data = request.get_json(silent=True)

        if not data or "text" not in data:
            return jsonify({
                "error": "Missing required field: text"
            }), 400

        # Placeholder response
        return jsonify({
            "message": "Endpoint wired up",
            "received_text": data["text"]
        })

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
