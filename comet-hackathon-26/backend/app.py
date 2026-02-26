from flask import Flask, request, jsonify
from flask_cors import CORS # 1. Make sure you installed this: pip install flask-cors
import random
import time

app = Flask(__name__)
# 2. THIS IS CRITICAL: This allows the browser to connect to the server
CORS(app) 

# Change this to your actual name
USER_NAME = "Roshni" 

# -----------------------------------------
# GREETING LOGIC
# -----------------------------------------
def get_random_greeting():
    phrases = ["study", "explore", "know about", "learn"]
    chosen_action = random.choice(phrases)
    return f"Hi {USER_NAME}, what would you like to {chosen_action} today?"

@app.route("/ask", methods=["POST"])
def ask():
    try:
        data = request.json
        subject = data.get("subject", "physics").lower()
        question = data.get("question", "").strip().lower()

        # 3. CHECK FOR GREETING
        if question in ["hi", "hello", "hey", "hello there"]:
            return jsonify({
                "answer": get_random_greeting(),
                "citation": None,
                "confidence": "High"
            })

        # 4. DEFAULT SEARCH LOGIC (STRICT MODE)
        # Simulate processing time
        time.sleep(1) 
        
        # Here you would put your actual logic to search your PDF/TXT notes
        return jsonify({
            "answer": f"Information not found in your {subject} notes. [Strict Mode Active]",
            "citation": None,
            "confidence": "Low"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Ensure port matches what React is calling (usually 5000)
    print("🚀 Backend is running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)