import os
import json
from config import PROCESSED_FOLDER, MATCH_THRESHOLD
from utils.text_cleaner import extract_keywords, clean_text

def search_answer(subject, question):
    keywords = extract_keywords(question)

    if not keywords:
        return None

    best_match = None
    best_score = 0

    for file in os.listdir(PROCESSED_FOLDER):
        if not file.startswith(subject):
            continue

        with open(os.path.join(PROCESSED_FOLDER, file), "r", encoding="utf-8") as f:
            data = json.load(f)

        for page in data["pages"]:
            page_text_clean = clean_text(page["text"])

            match_count = sum(1 for k in keywords if k in page_text_clean)
            score = match_count / len(keywords)

            if score > best_score:
                best_score = score
                best_match = {
                    "answer": page["text"],
                    "file": data["file_name"],
                    "page": page["page"],
                    "confidence": calculate_confidence(score)
                }

    if best_score < MATCH_THRESHOLD:
        return None

    return best_match


def calculate_confidence(score):
    if score >= 0.75:
        return "high"
    elif score >= 0.5:
        return "medium"
    else:
        return "low"