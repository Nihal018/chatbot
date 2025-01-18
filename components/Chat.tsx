"use client";

import { useState } from "react";
import { ChatSidebar } from "../components/ChatSideBar";
import { usePersistedChat } from "../hook/usePersistedChat";
import { ChatInput } from "./chatUI/ChatInput";
import { ChatflowLayout } from "./chatUI/ChatflowLayout";
import { ChatMessages } from "./chatUI/ChatMessages";

export function Chat({ chatId }: { chatId?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    usePersistedChat(chatId);

  // the handleInputChange and handleSubmit come from the useChat hook in the ai sdk so they expect events as input
  const onInputChange = (text: string) => {
    const syntheticEvent = {
      target: { value: text },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);
  };

  const onSubmit = async (options?: { files?: FileList }) => {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    await handleSubmit(syntheticEvent, {
      experimental_attachments: options?.files,
    });
  };

  return (
    <ChatflowLayout onOpenSidebar={() => setIsSidebarOpen(true)}>
      <ChatMessages messages={messages} />

      <ChatInput
        handleInputChange={onInputChange}
        input={input}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        stop={stop}
      />

      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </ChatflowLayout>
  );
}
