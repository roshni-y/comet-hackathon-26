📚 AskMyNotes: AI-Powered Study Workspace by Team Comet
AskMyNotes is a professional study assistant inspired by Google NotebookLM. It allows users to upload personal study materials (PDF, DOCX, TXT) and interact with them using a "Strict AI" model that prevents hallucinations by grounding all answers in your uploaded content.
🌟 Key Features
 * Multi-User Workspace: Secure login system with private, categorized libraries.
 * Cross-Format Support: Seamlessly index .pdf, .docx, and .txt files.
 * Zero-Hallucination RAG: The AI is strictly locked to your notes. If the answer isn't in your files, it won't guess.
 * Studio Mode (One-Click Generation):
   * 5 MCQs: Automatic practice quizzes with answers and explanations.
   * Short Answers: Extraction of 3 key direct questions and answers.
   * Summary: Bulleted takeaways of the entire document.
 * Speech-to-Speech:
   * Voice Input: Ask questions hands-free via microphone.
   * Azure Neural Voice: High-quality professional audio responses powered by Microsoft Azure.
 * Contextual Tabs: Dedicated workspaces for Physics, Chemistry, and Biology.
🛠️ Tech Stack
| Component | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS v4, Lucide React |
| Backend | Flask (Python), OpenAI API (GPT-3.5/4) |
| Voice | Azure Cognitive Services (Neural TTS), Web Speech API |
| Parsing | PyMuPDF, Python-Docx, NLTK |
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

🚀 Installation & Setup
1. Clone the Repository
git clone https://github.com/roshni-y/comet-hackathon-26.git
cd comet-hackathon-26

2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

Configure Environment Variables:
Create a .env file in the backend/ folder:
OPENAI_API_KEY=your_openai_key
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region

Run the server:
python app.py

3. Frontend Setup
cd ../frontend
npm install
npm run dev

📖 Usage Guide
 * Login: Access the dashboard using your credentials.
 * Select Subject: Toggle between Physics, Chemistry, or Biology tabs.
 * Upload: Use the "Add Notes" button to upload your documents.
 * Interact: * Type questions in the chat bar or use the Mic icon for voice queries.
   * Use the Sidebar buttons to trigger "Studio Mode" for instant summaries or quizzes.
 * Reset: Use "New Chat" to clear the session and start a new topic.
🔒 Security Note
> Important: This project uses .env files for API keys. This file is included in .gitignore to prevent accidental leaks. Never commit your actual API keys to GitHub.
> 
Created with ❤️ by Team Comet
