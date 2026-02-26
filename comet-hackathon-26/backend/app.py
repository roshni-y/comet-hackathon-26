from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS
from utils.pdf_processor import process_pdf
from utils.keyword_matcher import search_answer

app = Flask(__name__)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs("processed", exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        subject = request.form.get("subject")
        file = request.files.get("file")

        if not subject or not file:
            return jsonify({"error": "Missing subject or file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files allowed"}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        process_pdf(subject, file_path, filename)

        return jsonify({"message": "File uploaded and processed successfully"})

    except Exception:
        return jsonify({"error": "File processing failed"}), 500


@app.route("/ask", methods=["POST"])
def ask_question():
    try:
        data = request.json
        subject = data.get("subject")
        question = data.get("question")

        if not subject or not question:
            return jsonify({"error": "Missing subject or question"}), 400

        result = search_answer(subject, question)

        if result is None:
            return jsonify({
                "answer": f"Not found in your notes for {subject}"
            })

        return jsonify(result)

    except Exception:
        return jsonify({"error": "Failed to process question"}), 500


if __name__ == "__main__":
    app.run(debug=True)
    