"use client";

import { useChat } from "ai/react";
import { useEffect } from "react";
import { useChatPersistence } from "./useChatPersistence";
export function usePersistedChat(chatId?: string) {
  const {
    loadMessages,
    saveMessage,
    createNewChat,
    isInitialized,
    setIsInitialized,
  } = useChatPersistence(chatId);

  const chat = useChat({
    body: { chatId },
    maxSteps: 5,
    id: chatId,
  });

  useEffect(() => {
    let mounted = true;

    if (chatId && !isInitialized) {
      loadMessages().then((messages) => {
        if (mounted && messages) {
          chat.setMessages(messages);
          setIsInitialized(true);
        }
      });
    }

    return () => {
      mounted = false;
    };
  }, [chat, chatId, isInitialized]);

  useEffect(() => {
    setIsInitialized(false);
  }, [chatId]);

  const handleSubmit = async (
    e: React.FormEvent,
    options?: { experimental_attachments?: FileList }
  ) => {
    e.preventDefault();
    if (!chat.input.trim()) return;

    try {
      if (!chatId) {
        const newChat = await createNewChat(chat.input.slice(0, 50));
        await saveMessage(newChat.id, chat.input, "user");
        chat.handleSubmit(e, { ...options, body: { chatId: newChat.id } });
      } else {
        await saveMessage(chatId, chat.input, "user");
        chat.handleSubmit(e, { ...options, body: { chatId } });
      }
    } catch (error) {
      console.error("Error handling submit:", error);
    }
  };

  return { ...chat, handleSubmit };
}
