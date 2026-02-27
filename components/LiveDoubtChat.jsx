"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Send, X, MessageCircle, Clock, HelpCircle } from "lucide-react";

// Connect to the standalone Socket server (port 3001)
const socket = io("http://localhost:3001");

export default function LiveDoubtChat({ doubtId, currentUser, onClose }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 1. Join the specific room for this doubt
    if (doubtId) {
      socket.emit("join_doubt_room", doubtId);
    }

    // 2. Listen for incoming messages from peers
    const handler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handler);

    // Cleanup when the user closes the chat
    return () => {
      socket.off("receive_message", handler);
    };
  }, [doubtId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (currentMessage.trim() === "") return;

    const messageData = {
      doubtId: doubtId,
      sender: currentUser,
      text: currentMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Emit to the Socket server
    socket.emit("send_message", messageData);

    // Add to our own local UI immediately
    setMessageList((list) => [...list, messageData]);
    setCurrentMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[550px] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[#0d0d0d] border border-white/10 ring-1 ring-white/5 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
            <HelpCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none flex items-center gap-2">
              Live Peer Support
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-emerald-400/70 mt-1 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> Room: {doubtId?.slice(-6) || "—"}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        <div className="text-center py-4">
          <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-neutral-500 border border-white/5">
            Connected. Ask your doubt — peers will see it in real time.
          </span>
        </div>

        {messageList.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.sender === currentUser ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] text-neutral-500 mb-1 px-1">{msg.sender}</span>
            <div
              className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                msg.sender === currentUser
                  ? "bg-emerald-500 text-white rounded-tr-none"
                  : "bg-white/5 text-neutral-200 border border-white/10 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[8px] text-neutral-600 mt-1 flex items-center gap-1">
              <Clock className="h-2 w-2" /> {msg.time}
            </span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-black/40">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a peer or senior..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-neutral-600"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
