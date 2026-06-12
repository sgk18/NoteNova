"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useDMSocket(userId) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messageListeners = useRef(new Set());
  const typingListeners = useRef(new Set());
  const stopTypingListeners = useRef(new Set());
  const seenListeners = useRef(new Set());
  const statusListeners = useRef(new Set());

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("dm:join", userId);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Receive the full list of online users on connect
    socket.on("dm:online-users", (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    // Real-time status updates
    socket.on("dm:status", ({ userId: uid, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(uid);
        else next.delete(uid);
        return next;
      });
      statusListeners.current.forEach((cb) => cb({ userId: uid, status }));
    });

    // Incoming DM message
    socket.on("dm:message", (message) => {
      messageListeners.current.forEach((cb) => cb(message));
    });

    // Typing indicators
    socket.on("dm:typing", (data) => {
      typingListeners.current.forEach((cb) => cb(data));
    });

    socket.on("dm:stop-typing", (data) => {
      stopTypingListeners.current.forEach((cb) => cb(data));
    });

    // Read receipts
    socket.on("dm:seen", (data) => {
      seenListeners.current.forEach((cb) => cb(data));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const sendMessage = useCallback(
    (conversationId, recipientId, text) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("dm:message", {
          conversationId,
          senderId: userId,
          recipientId,
          text,
        });
      }
    },
    [userId]
  );

  const startTyping = useCallback(
    (conversationId, recipientId) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("dm:typing", {
          conversationId,
          userId,
          recipientId,
        });
      }
    },
    [userId]
  );

  const stopTyping = useCallback(
    (conversationId, recipientId) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("dm:stop-typing", {
          conversationId,
          userId,
          recipientId,
        });
      }
    },
    [userId]
  );

  const markSeen = useCallback(
    (conversationId, senderId) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("dm:seen", {
          conversationId,
          userId,
          senderId,
        });
      }
    },
    [userId]
  );

  const onMessage = useCallback((cb) => {
    messageListeners.current.add(cb);
    return () => messageListeners.current.delete(cb);
  }, []);

  const onTyping = useCallback((cb) => {
    typingListeners.current.add(cb);
    return () => typingListeners.current.delete(cb);
  }, []);

  const onStopTyping = useCallback((cb) => {
    stopTypingListeners.current.add(cb);
    return () => stopTypingListeners.current.delete(cb);
  }, []);

  const onSeen = useCallback((cb) => {
    seenListeners.current.add(cb);
    return () => seenListeners.current.delete(cb);
  }, []);

  const onStatusChange = useCallback((cb) => {
    statusListeners.current.add(cb);
    return () => statusListeners.current.delete(cb);
  }, []);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markSeen,
    onMessage,
    onTyping,
    onStopTyping,
    onSeen,
    onStatusChange,
  };
}
