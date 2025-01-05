"use client";

import React from "react";
import { Chat } from "../../../components/Chat";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const chatIdNumber = parseInt(id);

  return (
    <main>
      <Chat chatId={chatIdNumber} />
    </main>
  );
}
