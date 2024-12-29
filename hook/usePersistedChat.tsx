"use client";

import { useChat, Message } from "ai/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function usePersistedChat(chatId?: number) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, ...rest } = useChat(
    {
      body: { chatId },
      maxSteps: 5,
      id: chatId?.toString(),
    }
  );

  useEffect(() => {
    let mounted = true;

    async function loadMessages() {
      if (chatId && !isInitialized) {
        try {
          const response = await fetch(`/api/chat/${chatId}`);
          const existingMessages = await response.json();
          if (mounted) {
            existingMessages.forEach((msg: Message) => {
              rest.setMessages((prev) => [...prev, msg]);
            });
            setIsInitialized(true);
          }
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    }

    loadMessages();
    return () => {
      mounted = false;
    };
  }, [chatId, isInitialized, rest]);

  const handleSubmitWithPersistence = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement>,
      options?: { experimental_attachments?: FileList }
    ) => {
      e.preventDefault();

      if (
        !input.trim() &&
        (!options?.experimental_attachments ||
          options.experimental_attachments.length === 0)
      ) {
        return;
      }

      try {
        let currentChatId = chatId;

        if (currentChatId === undefined) {
          const response = await fetch("/api/chat/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: input.slice(0, 50) }),
          });

          if (!response.ok) {
            throw new Error("Failed to create chat");
          }

          const chat = await response.json();
          currentChatId = chat.id;

          // Save first message
          const messageResponse = await fetch(`/api/chat/${currentChatId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: input.trim(),
              role: "user",
            }),
          });

          if (!messageResponse.ok) {
            throw new Error("Failed to save message");
          }

          handleSubmit(e, {
            experimental_attachments: options?.experimental_attachments,
          });

          console.log("handleSubmit trigerred message sent to openai");

          setTimeout(() => {
            router.push(`/chat/${currentChatId}`);
          }, 300);
        } else {
          const messageResponse = await fetch(`/api/chat/${currentChatId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: input.trim(),
              role: "user",
            }),
          });

          if (!messageResponse.ok) {
            throw new Error("Failed to save message");
          }

          handleSubmit(e, {
            experimental_attachments: options?.experimental_attachments,
          });
        }
      } catch (error) {
        console.error("Error handling submit:", error);
      }
    },
    [chatId, input, handleSubmit, router]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleSubmitWithPersistence,
    ...rest,
  };
}
