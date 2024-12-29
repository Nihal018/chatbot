import { eq } from "drizzle-orm";
import { db } from "../index";
import { chatsTable } from "../schema";
import { NextResponse } from "next/server";

export async function deleteChat(chatId: number) {
  await db.delete(chatsTable).where(eq(chatsTable.id, chatId));
  return NextResponse.json({ message: "Chat deleted successfully" });
}
