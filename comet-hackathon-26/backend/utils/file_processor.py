import os
from pypdf import PdfReader
from config import PROCESSED_FOLDER


def process_file(subject, file_path, filename):
    ext = filename.rsplit(".", 1)[1].lower()

    text_content = ""

    if ext == "pdf":
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content += page_text

    elif ext == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text_content = f.read()

    # Save processed lowercase text
    processed_path = os.path.join(PROCESSED_FOLDER, f"{subject}.txt")

    with open(processed_path, "w", encoding="utf-8") as f:
        f.write(text_content.lower())