import re
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

STOP_WORDS = set(stopwords.words("english"))

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text

def extract_keywords(question):
    question = clean_text(question)
    words = question.split()
    keywords = [w for w in words if w not in STOP_WORDS and len(w) > 2]
    return keywords