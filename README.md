📚 AskMyNotes: AI-Powered Study Workspace by Team Comet

AskMyNotes is a professional study assistant inspired by Google NotebookLM. It allows users to upload their personal study materials (PDF, DOCX, TXT) and interact with them using a "Strict AI" that only answers based on the provided content. Featuring a modern Teal-themed dashboard, it includes automated quiz generation and Azure-powered voice-to-voice conversation.

![alt text](https://img.shields.io/badge/Theme-Teal%20%26%20Clean-3ca3a0)


![alt text](https://img.shields.io/badge/AI-OpenAI%20%2B%20Azure-blue)


![alt text](https://img.shields.io/badge/Users-Multi--User%20Library-green)

🌟 Key Features

Multi-User Workspace: Secure login system with private libraries for different users.

Cross-Format Support: Attach and index .pdf, .docx, and .txt files seamlessly.

Strict Note Adherence: The AI is locked to your notes. If the answer isn't in your files, it won't hallucinate or guess.

Studio Mode:

5 MCQs: Generates a practice quiz with answers and explanations.

Short Answers: Extracts 3 key direct questions and answers.

Summary: Provides a bulleted takeaways list of your entire document.

Speech-to-Speech:

Voice Input: Ask questions using your microphone.

Azure Neural Voice: High-quality professional audio responses powered by Microsoft Azure.

Contextual Tabs: Separate workspaces for Physics, Chemistry, and Biology.

📂 Project Structure
AskMyNotes/
├── backend/                # Flask Server (Python)
│   ├── uploads/            # User-specific private file storage
│   ├── app.py              # Main API (RAG Logic, Azure TTS, OpenAI)
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API Keys (OpenAI & Azure)
├── frontend/               # React + Vite (JavaScript)
│   ├── src/
│   │   ├── App.jsx         # Main UI Logic & Chat Interface
│   │   ├── index.css       # Tailwind CSS v4 Styling (Teal Theme)
│   │   └── main.jsx        # Entry point
│   ├── tailwind.config.js  # Style configuration
│   └── package.json        # Frontend dependencies
└── README.md

Frontend:

React.js (Vite)

Tailwind CSS (Teal/White Minimalist UI)

Lucide React (Iconography)

Web Speech API (Speech-to-Text)

Backend:

Flask (Python)

OpenAI API (GPT-3.5/4 for RAG)

Microsoft Azure Cognitive Services (Neural TTS)

PyMuPDF & Python-Docx (File Parsing)

NLTK (Text Processing)

🚀 Installation & Setup
1. Clone the Repository
code
Bash
download
content_copy
expand_less
git clone https://github.com/roshni-y/comet-hackathon-26.git
cd comet-hackathon-26
2. Backend Setup
code
Bash
download
content_copy
expand_less
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

Create a .env file in the backend/ folder:

code
Text
download
content_copy
expand_less
OPENAI_API_KEY=your_openai_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region

Run the server:

code
Bash
download
content_copy
expand_less
python app.py
3. Frontend Setup
code
Bash
download
content_copy
expand_less
cd ../frontend
npm install

Run the React app:

code
Bash
download
content_copy
expand_less
npm run dev
📖 Usage Guide

Login: Use default credentials (e.g., roshni / roshni123).

Select Subject: Choose between Physics, Chemistry, or Biology from the top tabs.

Upload Notes: Click "Add Notes" to upload your study material.

Interact:

Type a question in the bar.

Or click the Mic icon to speak your question.

Studio Mode: Click buttons on the right sidebar to instantly generate structured MCQs or Summaries.

New Chat: Use the "New Chat" button to wipe the current session and start fresh.

🔒 Security Note

This project uses .env files to store API keys. Never commit your .env file to GitHub. It is already included in the .gitignore to prevent accidental leaks.
