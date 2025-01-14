import { NextResponse } from "next/server";
import { db } from "..";
import { chatsTable } from "../schema";
import { eq } from "drizzle-orm";

export class Chat {
  static async create(name: string) {
    const id: { id: string }[] = await db
      .insert(chatsTable)
      .values({ name: name })
      .returning({ id: chatsTable.id });

    return id[0].id;
  }
  static async getAll() {
    return await db.select().from(chatsTable).orderBy(chatsTable.createdAt);
  }

  static async delete(chatId: string) {
    await db.delete(chatsTable).where(eq(chatsTable.id, chatId));
    return NextResponse.json({ message: "Chat deleted successfully" });
  }
}
