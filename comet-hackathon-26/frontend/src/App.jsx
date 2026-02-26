import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Plus, Layout, MessageSquare, Trash2, 
  Send, CheckCircle, BookOpen, HelpCircle, Loader2, User, Lock, LogOut 
} from 'lucide-react';

const App = () => {
  // --- AUTH STATE ---
  const [user, setUser] = useState(localStorage.getItem('user') || null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState('physics');
  const [sources, setSources] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // --- HANDLERS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', data.user);
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch {
      alert("Backend offline. Ensure app.py is running on port 5000.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setMessages([]);
    setSources([]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user', user);
    formData.append('subject', activeTab);

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/upload', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      
      if (res.ok) {
        setSources([...sources, { id: Date.now(), name: file.name, tab: activeTab }]);
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: `✅ File "${file.name}" uploaded and indexed for ${activeTab}.` 
        }]);
      } else {
        alert("Upload Error: " + data.message);
      }
    } catch (err) {
      alert("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const onAsk = async () => {
    if (!input.trim() || loading) return;
    
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, subject: activeTab, question: currentInput })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: data.answer, 
        citation: data.citation 
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Error connecting to backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const onStudioTask = async (taskType) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/generate-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, subject: activeTab, task: taskType })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer }]);
    } catch {
      alert("Failed to generate studio content.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  // --- RENDER LOGIN ---
  if (!user) {
    return (
      <div className="h-screen w-full bg-[#3ca3a0] flex items-center justify-center p-6 font-sans text-[#2c4a49]">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center border-b-8 border-teal-600">
           <div className="bg-[#3ca3a0] w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
             <Layout size={40} />
           </div>
           <h1 className="text-4xl font-black italic text-[#3ca3a0] mb-2 uppercase tracking-tighter">AskAnyQuestions</h1>
           <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-10">Smart Notebook AI</p>
           <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <User className="absolute left-5 top-5 text-teal-200" size={20} />
                <input type="text" placeholder="Username" className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-5 pl-14 pr-6 outline-none focus:border-[#3ca3a0] font-bold" onChange={e => setLoginData({...loginData, username: e.target.value})} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-5 text-teal-200" size={20} />
                <input type="password" placeholder="Password" className="w-full bg-gray-50 border-2 border-gray-100 rounded-3xl py-5 pl-14 pr-6 outline-none focus:border-[#3ca3a0] font-bold" onChange={e => setLoginData({...loginData, password: e.target.value})} required />
              </div>
              <button type="submit" className="w-full bg-[#3ca3a0] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-600 active:scale-95 transition-all">Enter Workspace</button>
           </form>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="flex flex-col h-screen w-full bg-[#3ca3a0] font-sans overflow-hidden">
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2.5 rounded-xl text-[#3ca3a0] shadow-lg"><Layout size={28}/></div>
          <h1 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">AskAnyQuestions</h1>
        </div>

        <div className="flex bg-black/10 p-1.5 rounded-2xl backdrop-blur-xl border border-white/10">
          {['physics', 'chemistry', 'biology'].map(tab => (
            <button 
              key={tab} 
              onClick={() => {setActiveTab(tab); setMessages([]);}} 
              className={`px-10 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === tab ? 'bg-white text-[#3ca3a0] shadow-xl scale-105' : 'text-white/60 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right text-white">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Active Session</p>
            <p className="text-lg font-black capitalize italic">{user}</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 p-3 rounded-2xl text-white hover:bg-white hover:text-[#3ca3a0] transition-all shadow-lg">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-8 pt-2 gap-8">
        
        {/* LEFT: LIBRARY */}
        <section className="w-96 bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-b-8 border-teal-50">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-teal-800">Library Content</h2>
          </div>
          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            <button 
              onClick={() => fileInputRef.current.click()} 
              className="w-full py-10 border-4 border-dashed border-teal-50 rounded-[2.5rem] text-[#3ca3a0] font-black text-xs uppercase tracking-widest hover:bg-teal-50 hover:border-teal-200 transition-all flex flex-col items-center gap-3"
            >
              <Plus size={32}/> Add {activeTab} Notes
            </button>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.docx" />
            
            {sources.filter(s => s.tab === activeTab).map(s => (
              <div key={s.id} className="flex items-center gap-4 p-5 bg-teal-50/50 rounded-3xl border border-teal-100">
                <FileText size={20} className="text-[#3ca3a0]"/>
                <span className="text-sm font-black truncate flex-1 text-teal-900">{s.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CENTER: CHAT */}
        <section className="flex-1 bg-white rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border-b-8 border-teal-50">
          <div className="flex-1 overflow-y-auto p-12 space-y-8" ref={scrollRef}>
            {messages.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-5">
                <MessageSquare size={200}/>
                <p className="mt-6 font-black uppercase text-2xl tracking-[0.4em]">Chat Mode</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-7 rounded-[2.5rem] text-sm font-black leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-[#3ca3a0] text-white rounded-tr-none shadow-teal-100' : 'bg-gray-50 border-2 border-gray-100 rounded-tl-none text-gray-700'}`}>
                      <p>{m.text}</p>
                      {m.citation && <p className="mt-4 text-[10px] text-teal-400 uppercase border-t-2 pt-4 border-teal-100 tracking-widest font-black">Ref: {m.citation}</p>}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-teal-50 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-3 text-teal-400 font-black text-xs uppercase tracking-widest animate-pulse border-2 border-teal-100">
                      <Loader2 className="animate-spin" size={18}/> Thinking...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-10 bg-white border-t-2 border-gray-50">
            <div className="max-w-3xl mx-auto flex items-center bg-gray-50 rounded-[2rem] border-2 border-gray-100 p-3 focus-within:border-[#3ca3a0] transition-all">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && onAsk()} 
                placeholder={`Hi ${user}, ask anything about ${activeTab}...`} 
                className="flex-1 bg-transparent outline-none px-8 py-3 text-sm font-black text-gray-700 placeholder:text-gray-300" 
              />
              <button onClick={onAsk} className="bg-[#3ca3a0] text-white p-5 rounded-2xl shadow-2xl hover:bg-teal-600 active:scale-90 transition-all">
                <Send size={24}/>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: STUDIO */}
        <section className="w-96 flex flex-col gap-8">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 flex-1 flex flex-col border-b-8 border-teal-50">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-teal-200 mb-12">Studio</h2>
            <div className="space-y-5">
               <button onClick={() => onStudioTask('mcq')} className="w-full p-6 bg-teal-50/50 rounded-3xl border-2 border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-5 group">
                  <CheckCircle className="text-orange-400 group-hover:scale-125 transition-transform" size={32} />
                  <div className="text-left leading-tight"><span className="block text-xs font-black uppercase text-teal-900">5 MCQs</span><span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Generate Quiz</span></div>
               </button>
               <button onClick={() => onStudioTask('short')} className="w-full p-6 bg-teal-50/50 rounded-3xl border-2 border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-5 group">
                  <HelpCircle className="text-purple-400 group-hover:scale-125 transition-transform" size={32} />
                  <div className="text-left leading-tight"><span className="block text-xs font-black uppercase text-teal-900">2 Short Answers</span><span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Key Concepts</span></div>
               </button>
               <button onClick={() => onStudioTask('summary')} className="w-full p-6 bg-teal-50/50 rounded-3xl border-2 border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-5 group">
                  <BookOpen className="text-blue-400 group-hover:scale-125 transition-transform" size={32} />
                  <div className="text-left leading-tight"><span className="block text-xs font-black uppercase text-teal-900">Summary</span><span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">Condensed</span></div>
               </button>
            </div>
            <div className="mt-auto p-6 bg-[#f0f9f9] rounded-[2.5rem] border-2 border-teal-100 text-center text-[10px] font-black uppercase text-teal-700 opacity-80 leading-relaxed italic">
                Strict Note Mode Active
            </div>
          </div>
          <button onClick={handleNewChat} className="w-full py-7 bg-white text-[#3ca3a0] rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all border-4 border-white">
            New Chat
          </button>
        </section>

      </main>
    </div>
  );
};

export default App;