"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize the socket server via the API route
    fetch("/api/socket").finally(() => {
      const socket = io();

      socket.on("connect", () => {
        setIsConnected(true);
        console.log("Socket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("Socket disconnected");
      });

      socketRef.current = socket;
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = (room) => {
    if (socketRef.current) {
      socketRef.current.emit("join-room", room);
    }
  };

  const sendMessage = (room, message, sender) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", {
        room,
        message,
        sender,
        timestamp: new Date().toISOString()
      });
    }
  };

  const emitEscalation = (department, user, question, id) => {
    if (socketRef.current) {
      socketRef.current.emit("escalation-request", {
        department,
        user,
        question,
        id
      });
    }
  };

  const onMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("receive-message", callback);
    }
  };

  const onEscalation = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("new-escalation", callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    sendMessage,
    emitEscalation,
    onMessage,
    onEscalation
  };
}
