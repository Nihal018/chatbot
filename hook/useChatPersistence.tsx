import { useState } from "react";

export function useChatPersistence(chatId?: string) {
  const [isInitialized, setIsInitialized] = useState(false);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  };

  const saveMessage = async (chatId: string, content: string, role: string) => {
    return await fetch(`/api/chat/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, role }),
    });
  };

  const createNewChat = async (name: string) => {
    const response = await fetch("/api/chat/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const chat = await response.json();
    return chat;
  };

  return {
    loadMessages,
    saveMessage,
    createNewChat,
    isInitialized,
    setIsInitialized,
  };
}
