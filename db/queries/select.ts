import { eq } from "drizzle-orm";
import { db } from "../index";
import { chatsTable, messagesTable } from "../schema";

export async function getChats() {
  return await db
    .select()
    .from(chatsTable)
    .orderBy(chatsTable.createdAt)
    .limit(10);
}

export async function getChatMessages(chatId: number) {
  return await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(messagesTable.createdAt);
}
