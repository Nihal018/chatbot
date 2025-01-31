import { NextResponse } from "next/server";
import { ChatDAO } from "@/db/models/Chat";

export async function GET() {
  try {
    const chats = await ChatDAO.getAll();
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { name } = await req.json();
  try {
    const id = await ChatDAO.create(name);

    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Error creating chats:", error);
    return NextResponse.json(
      { error: "Failed to create chats" },
      { status: 500 }
    );
  }
}
