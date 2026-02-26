"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, UserPlus, Upload, Heart, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const TYPE_ICONS = { follow: UserPlus, upload: Upload, like: Heart };

function timeAgo(dateStr) {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function NotificationBell() {
  const router = useRouter();
  const { theme } = useTheme();
  const isWhite = theme === "white";

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      const token = localStorage.getItem("token");
      fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationId: notif._id }),
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
    }

    setOpen(false);

    // Navigate based on type
    if (notif.type === "follow" && notif.fromUser?._id) {
      router.push(`/user/${notif.fromUser._id}`);
    } else if (notif.resourceId) {
      router.push(`/resource/${notif.resourceId}`);
    }
  };

  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const borderColor = isWhite ? "border-neutral-200" : "border-white/10";

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className={`relative p-2 rounded-lg transition-colors ${
          isWhite ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-white/5"
        }`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 mt-2 w-80 rounded-xl overflow-hidden shadow-xl z-50 border ${
          isWhite ? "bg-white border-gray-200" : "bg-slate-900 border-white/10"
        }`}>
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between border-b ${borderColor}`}>
            <h3 className={`text-sm font-semibold ${headingText}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className={`text-[11px] flex items-center gap-1 ${
                  isWhite ? "text-blue-600 hover:text-blue-700" : "text-cyan-400 hover:text-cyan-300"
                }`}
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className={`text-center py-10 text-sm ${mutedText}`}>No notifications yet</p>
            ) : (
              notifications.map(notif => {
                const TypeIcon = TYPE_ICONS[notif.type] || Bell;
                return (
                  <button
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b transition-colors ${borderColor} ${
                      !notif.read
                        ? isWhite ? "bg-blue-50/50" : "bg-white/5"
                        : isWhite ? "hover:bg-neutral-50" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      notif.type === "follow"
                        ? isWhite ? "bg-blue-50 text-blue-500" : "bg-blue-500/15 text-blue-400"
                        : notif.type === "upload"
                        ? isWhite ? "bg-green-50 text-green-500" : "bg-green-500/15 text-green-400"
                        : isWhite ? "bg-red-50 text-red-500" : "bg-red-500/15 text-red-400"
                    }`}>
                      <TypeIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-relaxed ${notif.read ? bodyText : headingText}`}>
                        {notif.message}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${mutedText}`}>{timeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
