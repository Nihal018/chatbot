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

  return (
    <ChatflowLayout onOpenSidebar={() => setIsSidebarOpen(true)}>
      <ChatMessages messages={messages} />

      <ChatInput
        handleInputChange={handleInputChange}
        input={input}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
      />

      {isSidebarOpen && (
        <ChatSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </ChatflowLayout>
  );
}
