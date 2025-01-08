import { NextResponse } from "next/server";
import { Message } from "@/db/models/Message";
import { Chat } from "@/db/models/Chat";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  try {
    const messages = await Message.getChatMessages(chatId);
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
  { params }: { params: Promise<{ chatId: string }> }
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
    return await Message.createMessage(chatId, content, role);
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
  {
    params,
  }: {
    params: Promise<{ chatId: string }>;
  }
) {
  const { chatId } = await params;

  return Chat.delete(chatId);
}
