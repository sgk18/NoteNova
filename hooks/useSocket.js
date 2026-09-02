"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

function getSocketUrl() {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal) {
      return "http://localhost:3001";
    }
  }
  return null;
}

export function useSocket() {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const targetUrl = getSocketUrl();
    if (!targetUrl) return;

    fetch("/api/socket").catch(() => {}).finally(() => {
      const s = io(targetUrl, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      s.on("connect", () => {
        setIsConnected(true);
      });

      s.on("connect_error", () => {
        setIsConnected(false);
      });

      s.on("disconnect", () => {
        setIsConnected(false);
      });

      socketRef.current = s;
      setSocket(s);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = useCallback((room) => {
    if (socketRef.current) {
      socketRef.current.emit("join-room", room);
    }
  }, []);

  const sendMessage = useCallback((room, message, sender) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", {
        room,
        message,
        sender,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  const emitEscalation = useCallback((department, user, question, id) => {
    if (socketRef.current) {
      socketRef.current.emit("escalation-request", {
        department,
        user,
        question,
        id
      });
    }
  }, []);

  const onMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on("receive-message", callback);
    }
  }, []);

  const onEscalation = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on("new-escalation", callback);
    }
  }, []);

  return {
    socket,
    isConnected,
    joinRoom,
    sendMessage,
    emitEscalation,
    onMessage,
    onEscalation
  };
}
