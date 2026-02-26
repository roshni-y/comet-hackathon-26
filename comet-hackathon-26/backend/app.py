from flask import Flask, request, jsonify
from flask_cors import CORS  # <--- CRITICAL FIX
import os
from werkzeug.utils import secure_filename
from docx import Document
import fitz  # pymupdf

app = Flask(__name__)
CORS(app) # 2. This line is mandatory to talk to React

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# This would typically be a database or a structured folder
knowledge_base = {
    "physics": [],
    "chemistry": [],
    "biology": []
}

def process_file(subject, file_path, filename):
    ext = filename.split('.')[-1].lower()
    text_chunks = []
    
    if ext == 'pdf':
        doc = fitz.open(file_path)
        for page_num, page in enumerate(doc):
            text_chunks.append({"text": page.get_text(), "ref": f"{filename} (Pg {page_num + 1})"})
    elif ext == 'docx':
        doc = Document(file_path)
        for i, para in enumerate(doc.paragraphs):
            if para.text.strip():
                text_chunks.append({"text": para.text, "ref": f"{filename} (Para {i + 1})"})
    elif ext == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            text_chunks.append({"text": f.read(), "ref": f"{filename}"})
    
    knowledge_base[subject.lower()].extend(text_chunks)

@app.route("/upload", methods=["POST"])
def upload():
    subject = request.form.get("subject")
    file = request.files.get("file")
    if not file or not subject:
        return jsonify({"status": "error", "message": "Missing data"}), 400
    
    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    
    process_file(subject, path, filename)
    return jsonify({"status": "success", "message": f"{filename} processed for {subject}"})

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    subject = data.get("subject").lower()
    question = data.get("question").lower()
    
    # Simple Keyword Matcher (Strict Note Logic)
    notes = knowledge_base.get(subject, [])
    for chunk in notes:
        # If any keyword from question exists in note
        if any(word in chunk['text'].lower() for word in question.split() if len(word) > 3):
            return jsonify({
                "answer": chunk['text'][:500] + "...", 
                "citation": chunk['ref'],
                "confidence": "High"
            })
            
    return jsonify({"answer": f"Not found in your notes for {subject}. [Strict Mode Active]"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)