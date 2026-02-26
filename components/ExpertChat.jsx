"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, User, MessageCircle, Clock, ShieldCheck } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";

export default function ExpertChat({ room, currentUser, topic, onClose }) {
  const { isConnected, sendMessage, onMessage, joinRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isConnected) {
      joinRoom(room);
      onMessage((data) => {
        setMessages((prev) => [...prev, data]);
      });
    }
  }, [isConnected, room]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(room, input, currentUser.name);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[550px] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[#0d0d0d] border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
            <MessageCircle className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">Senior Expert Chat</h3>
            <p className="text-[10px] text-cyan-400/70 mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Topic: {topic || "Academic Query"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        <div className="text-center py-4">
           <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-neutral-500 border border-white/5">
             Connection Secure. Waiting for a senior to join...
           </span>
        </div>
        
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === currentUser.name ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-neutral-500 mb-1 px-1">{m.sender}</span>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
              m.sender === currentUser.name 
                ? "bg-cyan-500 text-white rounded-tr-none" 
                : "bg-white/5 text-neutral-200 border border-white/10 rounded-tl-none"
            }`}>
              {m.message}
            </div>
            <span className="text-[8px] text-neutral-600 mt-1 flex items-center gap-1">
              <Clock className="h-2 w-2" /> {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/40">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 placeholder-neutral-600"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
