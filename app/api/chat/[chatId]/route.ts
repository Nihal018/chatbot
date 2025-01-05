import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { messagesTable } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { deleteChat } from "../../../../db/queries/delete";
import { createMessage } from "../../../../db/queries/insert";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  try {
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))
      .orderBy(messagesTable.createdAt);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = await params;
  try {
    const { content, role } = await req.json();

    if (!content || !role) {
      return NextResponse.json(
        { error: "Content and role are required" },
        { status: 400 }
      );
    }

    return createMessage(chatId, content, role);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = await params;

  return deleteChat(chatId);
}
