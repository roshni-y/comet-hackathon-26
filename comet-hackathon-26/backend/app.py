from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import random
import time
import fitz  # pymupdf
from docx import Document
import openai
from werkzeug.utils import secure_filename
from openai import OpenAI
import nltk
from nltk.tokenize import word_tokenize
from dotenv import load_dotenv

# 1. LOAD ENVIRONMENT VARIABLES
load_dotenv()

# Setup NLP tools
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

app = Flask(__name__)
CORS(app)

# 2. CONFIGURATION & AI CLIENT
# It tries to get from .env first; if not found, it uses your provided key
api_key = os.getenv("OPENAI_API_KEY") or "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"
client = OpenAI(api_key=api_key)

# --- CONFIGURATION ---
openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI()
UPLOAD_BASE = 'uploads'
os.makedirs(UPLOAD_BASE, exist_ok=True)

USER_KNOWLEDGE = {}
USERS = {"roshni": "roshni123", "sujal": "sujal123", "ronak": "ronak123"}

# -----------------------------------------
# HELPERS
# -----------------------------------------

def extract_text(file_path, filename):
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
    u, p = data.get("username", "").lower().strip(), data.get("password", "")
    if u in USERS and USERS[u] == p: return jsonify({"status": "success", "user": u})
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route("/upload", methods=["POST"])
def upload():
    try:
        user, subj = request.form.get("user").lower(), request.form.get("subject").lower()
        file = request.files.get("file")
        path = os.path.join(UPLOAD_BASE, user, subj)
        os.makedirs(path, exist_ok=True)
        fname = secure_filename(file.filename)
        fpath = os.path.join(path, fname)
        file.save(fpath)

        content = extract_text(fpath, fname)
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
