import { NextResponse } from "next/server";
import { chatsTable } from "@/db/schema";
import { db } from "../../../../db";

export async function GET() {
  try {
    const chats = await db
      .select()
      .from(chatsTable)
      .orderBy(chatsTable.createdAt)
      .limit(20);
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { name: string } }
) {
  const { name } = await req.json();
  try {
    const id: { id: number }[] = await db
      .insert(chatsTable)
      .values({ name: name })
      .returning({ id: chatsTable.id });

    return NextResponse.json({ id: id[0].id });
  } catch (error) {
    console.error("Error creating chats:", error);
    return NextResponse.json(
      { error: "Failed to create chats" },
      { status: 500 }
    );
  }
}
