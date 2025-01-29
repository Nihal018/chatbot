"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { useChatPersistence } from "./useChatPersistence";
export function usePersistedChat(initialChatId?: string) {
  const [currentChatId, setCurrentChatId] = useState(initialChatId);
  const {
    loadMessages,
    saveMessage,
    createNewChat,
    isInitialized,
    setIsInitialized,
  } = useChatPersistence(currentChatId);

  const chat = useChat({
    body: { chatId: currentChatId },
    maxSteps: 5,
    id: currentChatId,
  });
  useEffect(() => {
    let mounted = true;

    if (currentChatId && !isInitialized) {
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
  }, [chat, currentChatId, isInitialized, loadMessages, setIsInitialized]);

  useEffect(() => {
    setIsInitialized(false);
  }, [setIsInitialized]);

  const handleSubmit = async (
    e: React.FormEvent,
    options?: { experimental_attachments?: FileList }
  ) => {
    e.preventDefault();
    if (!chat.input.trim()) return;

    try {
      if (!currentChatId) {
        const newChat = await createNewChat(chat.input.slice(0, 50));
        chat.handleSubmit(e, {
          experimental_attachments: options?.experimental_attachments,
          body: { chatId: newChat.id },
        });
        await saveMessage(newChat.id, chat.input, "user");
        window.history.pushState({}, "", `/chat/${newChat.id}`);
        setCurrentChatId(newChat.id);
      } else {
        chat.handleSubmit(e, {
          experimental_attachments: options?.experimental_attachments,
          body: { chatId: currentChatId },
        });
        await saveMessage(currentChatId, chat.input, "user");
      }
    } catch (error) {
      console.error("Error handling submit:", error);
    }
  };

  return { ...chat, handleSubmit };
}
