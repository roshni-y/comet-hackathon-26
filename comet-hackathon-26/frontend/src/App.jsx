import React, { useState, useRef } from 'react';
import { FileText, Plus, Layout, MessageSquare, Trash2, Send, CheckCircle, BookOpen, HelpCircle } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('physics');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const fileInputRef = useRef(null);

  const tabs = ['physics', 'chemistry', 'biology'];

  return (
    // FULL SCREEN: Teal Background
    <div className="flex flex-col h-screen w-full bg-[#3ca3a0] font-sans overflow-hidden">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg text-[#3ca3a0] shadow-md"><Layout size={24}/></div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase">AskAnyQuestions</h1>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-black/10 p-1 rounded-xl backdrop-blur-md border border-white/10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                activeTab === tab ? 'bg-white text-[#3ca3a0] shadow-md scale-105' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#3ca3a0] font-black">R</div>
      </header>

      {/* THE 3 VERTICAL WHITE BOXES */}
      <main className="flex flex-1 overflow-hidden p-6 pt-2 gap-6">
        
        {/* DIVISION 1: ATTACHMENTS (White Box) */}
        <section className="w-80 bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Attachments</h2>
          </div>
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="w-full py-8 border-2 border-dashed border-teal-100 rounded-3xl text-[#3ca3a0] font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 transition-all flex flex-col items-center gap-2"
            >
              <Plus size={28}/> Add {activeTab} Notes
            </button>
            <input type="file" className="hidden" ref={fileInputRef} />
            
            <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100 opacity-50">
               <FileText size={18} className="text-[#3ca3a0]"/>
               <span className="text-[10px] font-black text-teal-800 uppercase tracking-tighter">No files yet</span>
            </div>
          </div>
        </section>

        {/* DIVISION 2: CHATBOT TASKBAR (White Box) */}
        <section className="flex-1 bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-10 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-5">
                <MessageSquare size={150}/>
                <p className="mt-4 font-black uppercase text-xl tracking-[0.3em]">Chat Mode</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-bold shadow-sm ${
                    m.role === 'user' ? 'bg-[#3ca3a0] text-white rounded-tr-none shadow-lg shadow-teal-100' : 'bg-gray-50 border border-gray-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CHATBAR */}
          <div className="p-8 bg-white border-t border-gray-50">
            <div className="max-w-2xl mx-auto flex items-center bg-gray-50 rounded-[1.5rem] border border-gray-200 p-2 focus-within:border-[#3ca3a0] transition-all">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setMessages([...messages, {role:'user', text:input}])}
                placeholder={`Ask ${activeTab} bot...`}
                className="flex-1 bg-transparent outline-none px-6 py-2 text-sm font-black text-gray-700 placeholder:text-gray-300 placeholder:uppercase"
              />
              <button className="bg-[#3ca3a0] text-white p-4 rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-600 active:scale-95 transition-all">
                <Send size={20}/>
              </button>
            </div>
          </div>
        </section>

        {/* DIVISION 3: STUDIO MODE (White Box) */}
        <section className="w-80 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 flex-1 flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-200 mb-8">Studio</h2>
            
            <div className="space-y-4">
               {[
                 { label: '5 MCQs', icon: CheckCircle, color: 'text-orange-400' },
                 { label: '2 Short Answers', icon: HelpCircle, color: 'text-purple-400' },
                 { label: 'Summary', icon: BookOpen, color: 'text-blue-400' }
               ].map((tool) => (
                <button key={tool.label} className="w-full p-5 bg-teal-50/50 rounded-3xl border border-teal-50 hover:bg-teal-100 transition-all flex items-center gap-4 group">
                  <tool.icon className={`${tool.color} group-hover:scale-110 transition-transform`} size={24} />
                  <div className="text-left">
                    <span className="block text-[11px] font-black uppercase text-teal-900 tracking-tight">{tool.label}</span>
                    <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest">Generate</span>
                  </div>
                </button>
               ))}
            </div>
            
            <div className="mt-auto p-5 bg-[#f0f9f9] rounded-[2rem] border border-teal-100">
               <p className="text-[9px] font-black uppercase text-teal-800 mb-2 tracking-widest">Workspace</p>
               <p className="text-[11px] font-bold text-teal-700/60 leading-tight">
                 Strict logic enabled. System analyzes {activeTab} sources only.
               </p>
            </div>
          </div>

          <button className="w-full py-5 bg-white text-[#3ca3a0] rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white">
            Add Notebook
          </button>
        </section>

      </main>
    </div>
  );
};

export default App;