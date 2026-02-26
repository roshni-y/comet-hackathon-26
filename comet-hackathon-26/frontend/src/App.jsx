import React, { useState, useRef } from 'react';
import { 
  FileText, Plus, Search, Share2, Settings, 
  Layout, CheckCircle, BookOpen, 
  GitBranch, MessageSquare, Trash2, Send, Loader2, Info, HelpCircle
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('physics');
  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'physics', label: 'Physics' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'biology', label: 'Biology' }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', activeTab);

    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:5000/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.status === "success") {
        setSources([...sources, { id: Date.now(), name: file.name, tab: activeTab }]);
      }
    } catch (err) {
      alert("Backend not running. Ensure app.py is active.");
    } finally { setLoading(false); }
  };

  const onAsk = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: activeTab, question: currentInput })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.answer, 
        citation: data.citation,
        confidence: data.confidence || 'High'
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection to backend failed." }]);
    } finally { setLoading(false); }
  };

  const filteredSources = sources.filter(s => s.tab === activeTab);

  return (
    <div className="flex flex-col h-screen bg-[#f8fdfd] text-[#2c4a49]">
      
      {/* HEADERBAR */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-teal-100 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#3ca3a0] p-2 rounded-lg text-white shadow-lg shadow-teal-100"><Layout size={20}/></div>
          <h1 className="text-2xl font-black italic tracking-tighter text-[#3ca3a0]">AskAnyQuestions</h1>
        </div>

        <div className="flex bg-teal-50/50 p-1 rounded-2xl border border-teal-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id ? 'bg-white text-[#3ca3a0] shadow-md' : 'text-teal-600/40 hover:text-teal-600'
              }`}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3ca3a0] rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md">R</div>
        </div>
      </header>

      {/* THREE DIVISION CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        
        {/* LEFT DIVISION: ATTACHMENTS (SOURCES) */}
        <section className="w-[300px] bg-white rounded-3xl border border-teal-50 flex flex-col shadow-sm">
          <div className="p-5 border-b border-teal-50 flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-teal-800">Sources</h2>
            <span className="bg-teal-50 text-teal-600 text-[10px] font-bold px-2 py-1 rounded-full">{filteredSources.length} added</span>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="w-full py-4 border-2 border-dashed border-teal-100 rounded-2xl text-[#3ca3a0] font-bold text-xs uppercase hover:bg-teal-50 transition-all flex flex-col items-center gap-2"
            >
              <Plus size={20}/> Add {activeTab} Notes
            </button>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx" />
            
            {filteredSources.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-4 bg-teal-50/30 rounded-2xl border border-teal-50 group hover:border-teal-200 transition-all">
                <FileText size={18} className="text-[#3ca3a0]"/>
                <span className="text-xs font-bold truncate flex-1">{s.name}</span>
                <Trash2 size={14} className="text-red-300 opacity-0 group-hover:opacity-100 cursor-pointer"/>
              </div>
            ))}
          </div>
        </section>

        {/* MIDDLE DIVISION: CHATBOT TASKBAR */}
        <section className="flex-1 bg-white rounded-3xl border border-teal-100 flex flex-col shadow-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-white to-[#f8fdfd]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <MessageSquare size={120}/>
                <p className="mt-4 font-black uppercase text-xl tracking-widest">Chat with your notes</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl ${
                    m.role === 'user' ? 'bg-[#3ca3a0] text-white shadow-xl rounded-tr-none' : 'bg-white border border-teal-100 shadow-sm rounded-tl-none'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                    {m.citation && (
                      <div className="mt-4 pt-3 border-t border-teal-50 flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase bg-teal-50 px-2 py-1 rounded text-[#3ca3a0]">Ref: {m.citation}</span>
                        <span className="text-[10px] font-black uppercase text-teal-300">Confidence: {m.confidence}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && <div className="text-teal-400 font-bold text-[10px] animate-pulse">Thinking...</div>}
          </div>

          {/* CHAT INPUT DIVISION */}
          <div className="p-6 bg-white border-t border-teal-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.02)]">
            <div className="max-w-3xl mx-auto flex items-center bg-[#f0f9f9] rounded-2xl border border-teal-100 p-2 focus-within:border-[#3ca3a0] transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAsk()}
                placeholder={`Ask any question about ${activeTab}...`}
                className="flex-1 bg-transparent outline-none px-4 py-2 text-sm font-bold"
              />
              <button 
                onClick={onAsk}
                className="bg-[#3ca3a0] text-white p-3 rounded-xl shadow-lg hover:bg-teal-600 transition-all active:scale-95"
              >
                <Send size={18}/>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT DIVISION: STUDY MODE TOOLS */}
        <section className="w-[320px] flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-teal-50 p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-300 mb-8 flex items-center gap-2">
              <GitBranch size={16} className="text-[#3ca3a0]"/> Studio Mode
            </h2>
            
            <div className="space-y-3">
               <button className="w-full p-5 bg-teal-50/40 rounded-2xl border border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-4 group">
                  <CheckCircle className="text-orange-400 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <span className="block text-[11px] font-black uppercase text-teal-900">5 MCQs</span>
                    <span className="text-[9px] font-bold text-teal-400">Generate practice quiz</span>
                  </div>
               </button>

               <button className="w-full p-5 bg-teal-50/40 rounded-2xl border border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-4 group">
                  <HelpCircle className="text-purple-400 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <span className="block text-[11px] font-black uppercase text-teal-900">2 Short Answers</span>
                    <span className="text-[9px] font-bold text-teal-400">Key concept summaries</span>
                  </div>
               </button>

               <button className="w-full p-5 bg-teal-50/40 rounded-2xl border border-teal-100 hover:bg-teal-100 transition-all flex items-center gap-4 group">
                  <BookOpen className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <span className="block text-[11px] font-black uppercase text-teal-900">Summary</span>
                    <span className="text-[9px] font-bold text-teal-400">Condensed takeaways</span>
                  </div>
               </button>
            </div>

            <div className="mt-auto p-5 bg-[#f0f9f9] rounded-2xl border border-teal-100">
               <div className="flex items-center gap-2 text-teal-800 mb-2"><Info size={14}/><span className="text-[10px] font-black uppercase tracking-tighter">Strict Note Mode</span></div>
               <p className="text-[11px] font-bold text-teal-800 leading-tight opacity-70">
                 System only answers from your {activeTab} notes. No external guessing.
               </p>
            </div>
          </div>

          <button className="w-full py-4 bg-[#3ca3a0] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-teal-100 hover:bg-teal-600 transition-all">
            Add Notebook
          </button>
        </section>

      </main>
    </div>
  );
};

export default App;