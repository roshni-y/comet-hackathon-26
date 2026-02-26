from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import fitz  # pymupdf
import nltk
from docx import Document
from werkzeug.utils import secure_filename
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download necessary tools for keyword cleaning
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

UPLOAD_BASE = 'uploads'
os.makedirs(UPLOAD_BASE, exist_ok=True)

# In-memory store for session content
# Structure: { "username": { "physics": [{"text": "...", "ref": "file.pdf"}, ...], ... } }
USER_KNOWLEDGE = {}

# -----------------------------------------
# FILE EXTRACTION LOGIC
# -----------------------------------------
def extract_text_from_file(file_path, filename):
    ext = filename.split('.')[-1].lower()
    text = ""
    
    if ext == 'pdf':
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
    elif ext == 'docx':
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
    elif ext == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
    return text

# -----------------------------------------
# KEYWORD MATCHING LOGIC (STRICT)
# -----------------------------------------
def find_best_match(question, chunks):
    # 1. Clean the question into significant keywords
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(question.lower())
    # Only keep words that aren't "the, is, at" and are longer than 2 letters
    keywords = [w for w in words if w.isalnum() and w not in stop_words and len(w) > 2]
    
    if not keywords: return None

    best_chunk = None
    max_score = 0

    for item in chunks:
        chunk_text = item['text'].lower()
        # Count how many unique keywords appear in this chunk
        score = sum(1 for word in keywords if word in chunk_text)
        
        if score > max_score:
            max_score = score
            best_chunk = item

    # Threshold: At least 40% of unique keywords must match to prevent "guessing"
    threshold = len(keywords) * 0.4
    if max_score >= max(1, threshold):
        return best_chunk
    return None

# -----------------------------------------
# ROUTES
# -----------------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    return jsonify({"status": "success", "user": data.get("username").lower()})

@app.route("/upload", methods=["POST"])
def upload():
    try:
        user = request.form.get("user", "guest").lower()
        subject = request.form.get("subject", "general").lower()
        file = request.files.get("file")
        
        filename = secure_filename(file.filename)
        path = os.path.join(UPLOAD_BASE, filename)
        file.save(path)

        text = extract_text_from_file(path, filename)
        
        # Split text into smaller paragraphs for precise matching
        paragraphs = [{"text": p.strip(), "ref": filename} for p in text.split('\n') if len(p.strip()) > 30]

        if user not in USER_KNOWLEDGE: USER_KNOWLEDGE[user] = {}
        if subject not in USER_KNOWLEDGE[user]: USER_KNOWLEDGE[user][subject] = []
        
        USER_KNOWLEDGE[user][subject].extend(paragraphs)

        return jsonify({"status": "success", "message": f"Learned from {filename}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    user = data.get("user", "").lower()
    subject = data.get("subject", "").lower()
    question = data.get("question", "")

    # Check for greetings
    if question.lower().strip() in ["hi", "hello", "hey"]:
        return jsonify({"answer": f"Hi {user.capitalize()}, I'm ready. Ask me anything about your {subject} notes!"})

    chunks = USER_KNOWLEDGE.get(user, {}).get(subject, [])
    match = find_best_match(question, chunks)

    if match:
        return jsonify({
            "answer": match['text'],
            "citation": match['ref'],
            "confidence": "High"
        })

    return jsonify({
        "answer": f"I'm sorry, I couldn't find a specific match for that in your {subject} notes. [Strict Mode]",
        "citation": None
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)