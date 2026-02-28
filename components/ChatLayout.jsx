"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDMSocket } from "@/hooks/useDMSocket";
import {
  Search,
  Send,
  MessageSquare,
  ArrowLeft,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-red-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-amber-500 to-yellow-600",
    "from-cyan-500 to-sky-600",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - msgDate) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Component ───────────────────────────────────────────────────────
export default function ChatLayout() {
  // ── Auth / User State ─────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (stored) setUser(JSON.parse(stored));
    if (t) setToken(t);
  }, []);

  const userId = user?.userId || user?.id || user?._id;

  // ── Socket ────────────────────────────────────────────────────────
  const {
    isConnected,
    onlineUsers,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markSeen,
    onMessage,
    onTyping,
    onStopTyping,
    onSeen,
  } = useDMSocket(userId);

  // ── Conversations ─────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [seenConversations, setSeenConversations] = useState(new Set());
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  // ── Active conversation data ──────────────────────────────────────
  const activeConv = conversations.find((c) => c._id === activeConvId);
  const recipientId = activeConv?.otherUser?._id;
  const recipientName = activeConv?.otherUser?.name || "Unknown";

  // ── Fetch conversations ───────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/dm/conversations", { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages when conversation changes ──────────────────────
  useEffect(() => {
    if (!activeConvId || !token) return;
    (async () => {
      try {
        const res = await fetch(`/api/dm/messages/${activeConvId}`, {
          headers: authHeaders,
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    })();
  }, [activeConvId, token]);

  // ── Mark as read when opening a conversation ──────────────────────
  useEffect(() => {
    if (!activeConvId || !token || !recipientId) return;
    // Mark as read via REST
    fetch("/api/dm/read", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ conversationId: activeConvId }),
    }).catch(() => {});
    // Notify via socket
    markSeen(activeConvId, recipientId);
  }, [activeConvId, token, recipientId, markSeen]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket listeners ──────────────────────────────────────────────
  useEffect(() => {
    const unsubMsg = onMessage((msg) => {
      // If message belongs to active conversation, add it
      if (msg.conversationId === activeConvId) {
        setMessages((prev) => {
          // Deduplicate by _id
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto mark as read if we're looking at this conversation
        if (msg.sender !== userId) {
          markSeen(activeConvId, msg.sender);
          fetch("/api/dm/read", {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ conversationId: activeConvId }),
          }).catch(() => {});
        }
      }
      // Update conversation list
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c._id === msg.conversationId) {
            return {
              ...c,
              lastMessage: {
                text: msg.text,
                sender: msg.sender,
                timestamp: msg.createdAt,
              },
              updatedAt: msg.createdAt,
            };
          }
          return c;
        });
        return updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    });

    const unsubTyping = onTyping(({ conversationId, userId: typingUid }) => {
      if (conversationId === activeConvId && typingUid !== userId) {
        setTypingUsers((prev) => new Set([...prev, typingUid]));
      }
    });

    const unsubStopTyping = onStopTyping(
      ({ conversationId, userId: typingUid }) => {
        if (conversationId === activeConvId) {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(typingUid);
            return next;
          });
        }
      }
    );

    const unsubSeen = onSeen(({ conversationId }) => {
      if (conversationId === activeConvId) {
        setSeenConversations((prev) => new Set([...prev, conversationId]));
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
      unsubStopTyping();
      unsubSeen();
    };
  }, [
    activeConvId,
    userId,
    onMessage,
    onTyping,
    onStopTyping,
    onSeen,
    markSeen,
    token,
  ]);

  // ── User search ───────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/dm/users/search?q=${encodeURIComponent(searchQuery)}`,
          { headers: authHeaders }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, token]);

  // ── Start conversation with a user ────────────────────────────────
  const startConversation = async (recipientUser) => {
    setSearchQuery("");
    setSearchResults([]);
    try {
      const res = await fetch("/api/dm/conversations", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ recipientId: recipientUser._id }),
      });
      if (res.ok) {
        const conv = await res.json();
        // Add to conversations list if new
        if (!conv.existing) {
          setConversations((prev) => [conv, ...prev]);
        }
        setActiveConvId(conv._id);
        setMobileShowChat(true);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  // ── Send message ──────────────────────────────────────────────────
  const handleSend = () => {
    const text = inputText.trim();
    if (!text || !activeConvId || !recipientId) return;

    socketSendMessage(activeConvId, recipientId, text);
    setInputText("");
    setSeenConversations((prev) => {
      const next = new Set(prev);
      next.delete(activeConvId);
      return next;
    });

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(activeConvId, recipientId);

    inputRef.current?.focus();
  };

  // ── Typing indicator ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeConvId || !recipientId) return;

    startTyping(activeConvId, recipientId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(activeConvId, recipientId);
    }, 2000);
  };

  // ── Key handler ───────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Group messages by date ────────────────────────────────────────
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  // ── Find last own message ─────────────────────────────────────────
  const lastOwnMessage = [...messages].reverse().find(
    (m) => (m.sender === userId || m.sender?._id === userId)
  );

  // ── Not logged in ─────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <MessageSquare
            className="mx-auto"
            size={48}
            style={{ color: "var(--accent-1)" }}
          />
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Sign in to access Messages
          </h2>
          <p style={{ color: "var(--text-muted)" }}>
            Log in to start chatting with other students.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* ─── Left Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`${
          mobileShowChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 lg:w-96 border-r flex-shrink-0`}
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--glass-border)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="p-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Messages
            </h1>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users to message..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--glass-border)",
                border: "1px solid var(--glass-border)",
              }}
              id="dm-search-input"
            />
            {/* Search Results Dropdown */}
            {searchQuery.length >= 2 && (
              <div
                className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--glass-border-strong)",
                }}
              >
                {isSearching ? (
                  <div
                    className="p-4 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div
                    className="p-4 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No users found
                  </div>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => startConversation(u)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
                      style={{ color: "var(--text-primary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--hover-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(
                          u.name
                        )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {u.department || u.college || u.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                >
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0"
                    style={{ background: "var(--input-bg)" }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 rounded-full w-24"
                      style={{ background: "var(--input-bg)" }}
                    />
                    <div
                      className="h-2.5 rounded-full w-36"
                      style={{ background: "var(--input-bg)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <MessageSquare
                size={40}
                style={{ color: "var(--text-muted)" }}
                className="mb-3 opacity-50"
              />
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                No conversations yet
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Search for a student above to start chatting
              </p>
            </div>
          ) : (
            <div className="p-1.5">
              {conversations.map((conv) => {
                const other = conv.otherUser;
                const isActive = conv._id === activeConvId;
                const isOnline = onlineUsers.has(other?._id);
                const hasUnread =
                  conv.lastMessage?.sender &&
                  conv.lastMessage.sender !== userId &&
                  !seenConversations.has(conv._id);

                return (
                  <button
                    key={conv._id}
                    onClick={() => {
                      setActiveConvId(conv._id);
                      setMobileShowChat(true);
                      setMessages([]);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 mb-0.5 ${
                      isActive ? "ring-1" : ""
                    }`}
                    style={{
                      background: isActive
                        ? "var(--hover-bg)"
                        : "transparent",
                      borderColor: isActive
                        ? "var(--border-accent)"
                        : "transparent",
                      ...(isActive
                        ? {
                            boxShadow: "0 0 0 1px var(--border-accent)",
                          }
                        : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "var(--hover-bg)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                    id={`conv-${conv._id}`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(
                          other?.name
                        )} flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {getInitials(other?.name)}
                      </div>
                      {/* Online indicator */}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                          isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                        style={{
                          borderColor: "var(--bg-secondary)",
                        }}
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm truncate ${
                            hasUnread ? "font-bold" : "font-medium"
                          }`}
                          style={{ color: "var(--text-primary)" }}
                        >
                          {other?.name || "Unknown"}
                        </p>
                        <span
                          className="text-[10px] flex-shrink-0 ml-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatTime(
                            conv.lastMessage?.timestamp || conv.updatedAt
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p
                          className={`text-xs truncate flex-1 ${
                            hasUnread ? "font-semibold" : ""
                          }`}
                          style={{
                            color: hasUnread
                              ? "var(--text-secondary)"
                              : "var(--text-muted)",
                          }}
                        >
                          {conv.lastMessage?.sender === userId && (
                            <span className="mr-1 opacity-60">You:</span>
                          )}
                          {conv.lastMessage?.text || "Start a conversation"}
                        </p>
                        {hasUnread && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: "var(--accent-1)" }}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ─── Right Panel (Chat Window) ─────────────────────────────── */}
      <main
        className={`${
          mobileShowChat ? "flex" : "hidden md:flex"
        } flex-col flex-1 min-w-0`}
        style={{ background: "var(--bg-primary)" }}
      >
        {!activeConvId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "var(--input-bg)" }}
            >
              <MessageSquare size={36} style={{ color: "var(--accent-1)" }} />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Your Messages
            </h2>
            <p
              className="text-sm text-center max-w-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Select a conversation from the sidebar or search for a student to
              start chatting about resources, bounties, and doubts.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header
              className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--glass-border)",
              }}
            >
              {/* Back button (mobile) */}
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                id="dm-back-btn"
              >
                <ArrowLeft size={20} />
              </button>
              {/* Recipient avatar */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(
                    recipientName
                  )} flex items-center justify-center text-white text-sm font-bold`}
                >
                  {getInitials(recipientName)}
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                    onlineUsers.has(recipientId)
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                  style={{ borderColor: "var(--bg-secondary)" }}
                />
              </div>
              <div>
                <h2
                  className="text-sm font-semibold leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {recipientName}
                </h2>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {typingUsers.size > 0
                    ? "typing..."
                    : onlineUsers.has(recipientId)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </header>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              id="dm-messages-area"
            >
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "var(--glass-border)" }}
                    />
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider px-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatDateHeader(msgs[0].createdAt)}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "var(--glass-border)" }}
                    />
                  </div>
                  {/* Messages */}
                  {msgs.map((msg, idx) => {
                    const isOwn =
                      msg.sender === userId || msg.sender?._id === userId;
                    const isLast = idx === msgs.length - 1;

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex mb-1.5 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative max-w-[75%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl ${
                            isOwn
                              ? "rounded-br-md"
                              : "rounded-bl-md"
                          }`}
                          style={{
                            background: isOwn
                              ? "var(--accent-1)"
                              : "var(--input-bg)",
                            color: isOwn ? "#fff" : "var(--text-primary)",
                          }}
                        >
                          <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                            {msg.text}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-0.5 ${
                              isOwn ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span
                              className="text-[10px] opacity-70"
                              style={{
                                color: isOwn
                                  ? "rgba(255,255,255,0.7)"
                                  : "var(--text-muted)",
                              }}
                            >
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            {isOwn && (
                              <span className="opacity-70">
                                {msg.readBy && msg.readBy.length > 1 ? (
                                  <CheckCheck
                                    size={12}
                                    className="text-blue-300"
                                  />
                                ) : (
                                  <Check size={12} />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Seen indicator */}
              {lastOwnMessage &&
                seenConversations.has(activeConvId) && (
                  <div className="flex justify-end pr-1">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "var(--accent-1)" }}
                    >
                      Seen ✓
                    </span>
                  </div>
                )}

              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1"
                    style={{ background: "var(--input-bg)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--text-muted)",
                        animationDelay: "0ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--text-muted)",
                        animationDelay: "150ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--text-muted)",
                        animationDelay: "300ms",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
              className="px-4 py-3 border-t flex-shrink-0"
              style={{
                background: "var(--bg-secondary)",
                borderColor: "var(--glass-border)",
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-1"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${recipientName}...`}
                  className="flex-1 py-2.5 text-sm bg-transparent outline-none"
                  style={{
                    color: "var(--text-primary)",
                    caretColor: "var(--accent-1)",
                  }}
                  id="dm-message-input"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg transition-all duration-200 disabled:opacity-30"
                  style={{
                    color: inputText.trim() ? "#fff" : "var(--text-muted)",
                    background: inputText.trim()
                      ? "var(--accent-1)"
                      : "transparent",
                  }}
                  id="dm-send-btn"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
