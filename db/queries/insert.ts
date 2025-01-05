import { NextResponse } from "next/server";
import { db } from "..";
import { chatsTable, messagesTable } from "../schema";

export async function createMessage(
  chatId: number,
  content: string,
  role: string
) {
  console.log("Creating message:", { chatId, role });
  try {
    const [message] = await db
      .insert(messagesTable)
      .values({ chatId, content, role })
      .returning();

    console.log("Message created:", message);

    return NextResponse.json({
      message: "Message saved successfully",
      data: message,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
export async function createChat(name: string) {
  const id: { id: number }[] = await db
    .insert(chatsTable)
    .values({ name: name })
    .returning({ id: chatsTable.id });
  return id[0].id;
}
