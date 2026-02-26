import os
from config import PROCESSED_FOLDER


def search_answer(subject, question):
    processed_path = os.path.join(PROCESSED_FOLDER, f"{subject}.txt")

    if not os.path.exists(processed_path):
        return None

    with open(processed_path, "r", encoding="utf-8") as f:
        text = f.read()

    question = question.lower()
    words = question.split()

    matched_sentences = []

    sentences = text.split(".")

    for sentence in sentences:
        for word in words:
            if word in sentence:
                matched_sentences.append(sentence.strip())
                break

    if not matched_sentences:
        return None

    return ". ".join(matched_sentences[:3])