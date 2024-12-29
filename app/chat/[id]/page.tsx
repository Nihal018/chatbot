"use client";
import Chat from "@/components/Chat";
import React from "react";

export default function ChatPage({ params }: { params: { id: string } }) {
  const { id } = React.use(params);
  const chatIdNumber = parseInt(id);

  return (
    <main>
      <Chat chatId={chatIdNumber} />
    </main>
  );
}
