import fitz
import json
import os
from config import PROCESSED_FOLDER

def process_pdf(subject, file_path, file_name):
    doc = fitz.open(file_path)

    pages = []

    for page_number in range(len(doc)):
        page = doc[page_number]
        text = page.get_text()

        pages.append({
            "page": page_number + 1,
            "text": text.strip()
        })

    data = {
        "subject": subject,
        "file_name": file_name,
        "pages": pages
    }

    output_path = os.path.join(PROCESSED_FOLDER, f"{subject}_{file_name}.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    return output_path