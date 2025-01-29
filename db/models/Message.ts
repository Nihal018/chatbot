import { NextResponse } from "next/server";
import { db } from "..";
import { messagesTable } from "../schema";
import { eq } from "drizzle-orm";

export class MessageDAO {
  static async createMessage(chatId: string, content: string, role: string) {
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

  static async getChatMessages(chatId: string) {
    try {
      const messages = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.chatId, chatId))
        .orderBy(messagesTable.createdAt);
      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }
}
