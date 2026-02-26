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

# Setup NLP tools
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

app = Flask(__name__)
CORS(app)

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
    try:
        if ext == 'pdf':
            with fitz.open(file_path) as doc:
                for page in doc: text += page.get_text()
        elif ext == 'docx':
            doc = Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        elif ext == 'txt':
            with open(file_path, 'r', encoding='utf-8') as f: text = f.read()
    except Exception as e: print(f"Error: {e}")
    return text

def generate_local_mcqs(context):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?]) +', context) if len(s.strip()) > 60]
    fact_sentences = [s for s in sentences if any(p in s.lower() for p in [" is ", " are ", " called ", " consists of "])]
    if len(fact_sentences) < 5: fact_sentences = sentences[:10]
    
    random.shuffle(fact_sentences)
    blocks = []
    for i, sent in enumerate(fact_sentences[:5]):
        words = [w.strip(".,()\"") for w in sent.split() if len(w) > 6]
        if not words: continue
        ans = random.choice(words)
        ques = sent.replace(ans, "__________", 1)
        
        all_words = list(set([w.strip(".,()\"") for w in context.split() if len(w) > 6 and w.lower() != ans.lower()]))
        random.shuffle(all_words)
        opts = random.sample(all_words, 3) + [ans]
        random.shuffle(opts)
        
        opt_fmt = "\n".join([f"{['A','B','C','D'][j]}) {o}" for j, o in enumerate(opts)])
        blocks.append(f"**QUESTION {i+1}**\n{ques}\n\n{opt_fmt}\n\n**Correct Answer:** {ans}")
    
    return "\n\n---\n\n".join(blocks)

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
        if subj not in USER_KNOWLEDGE[user]: USER_KNOWLEDGE[user][subj] = []
        
        # Smart Chunking
        lines = [l.strip() for l in content.split('\n') if len(l.strip()) > 10]
        curr = ""
        for l in lines:
            curr += l + " "
            if len(curr) > 600:
                USER_KNOWLEDGE[user][subj].append(curr.strip())
                curr = ""
        if curr: USER_KNOWLEDGE[user][subj].append(curr)
        return jsonify({"status": "success"})
    except Exception as e: return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    u, subj, ques = data.get("user").lower(), data.get("subject").lower(), data.get("question").strip()
    
    if ques.lower() in ["hi", "hello", "hey"]:
        return jsonify({"answer": f"Hi {u.capitalize()}, I'm ready. What would you like to study in {subj} today?"})

    notes = USER_KNOWLEDGE.get(u, {}).get(subj, [])
    if not notes: return jsonify({"answer": "Please upload notes first!"})

    try:
        # ATTEMPT AI
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "system", "content": f"Strict tutor for {subj}. Use notes only. Format with clear spacing."},
                      {"role": "user", "content": f"NOTES:\n{' '.join(notes)[:5000]}\n\nQ: {ques}"}]
        )
        return jsonify({"answer": resp.choices[0].message.content, "citation": "AI Verified"})
    except:
        # LOCAL FALLBACK
        q_words = set([w.lower() for w in word_tokenize(ques) if len(w) > 3])
        best_idx, max_s = -1, 0
        for i, c in enumerate(notes):
            s = sum(1 for w in q_words if w in c.lower())
            if s > max_s: max_s, best_idx = s, i
        
        if best_idx != -1:
            ans = notes[best_idx]
            if best_idx + 1 < len(notes): ans += "\n\n" + notes[best_idx+1]
            return jsonify({"answer": f"💡 **Notes Analysis:**\n\n{ans}", "citation": "Local Engine"})
        return jsonify({"answer": "No direct match found in your notes. [Strict Mode]"})

@app.route("/generate-studio", methods=["POST"])
def generate_studio():
    data = request.json
    u, subj, task = data.get("user").lower(), data.get("subject").lower(), data.get("task")
    notes = USER_KNOWLEDGE.get(u, {}).get(subj, [])
    if not notes: return jsonify({"answer": "Upload notes first!"})
    ctx = "\n\n".join(notes)

    try:
        prompts = {"mcq": "5 MCQs with answers.", "short": "2 Short Q&A pairs.", "summary": "Detailed bullet summary."}
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": f"Text: {ctx[:4000]}\nTask: {prompts[task]}. Use double newlines between items."}]
        )
        return jsonify({"answer": resp.choices[0].message.content})
    except:
        if task == "mcq": return jsonify({"answer": f"❓ **LOCAL PRACTICE QUIZ**\n\n{generate_local_mcqs(ctx)}"})
        elif task == "summary":
            res = "\n\n".join([f"• {n[:200]}..." for n in notes[:5]])
            return jsonify({"answer": f"📌 **LOCAL SUMMARY**\n\n{res}"})
        else:
            defs = [n for n in notes if " is " in n.lower()][:2]
            res = "\n\n".join([f"**Concept**\nExplain this: {d}" for d in defs])
            return jsonify({"answer": f"📝 **KEY CONCEPTS**\n\n{res}"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
