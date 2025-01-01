import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createMessage } from "../../../db/queries/insert";

export const maxDuration = 30;

const webSearch = tool({
  description: "Search the web for current information",
  parameters: z.object({
    query: z.string().describe("The search query to look up"),
  }),
  execute: async ({ query }) => {
    try {
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
      const GOOGLE_CX = process.env.GOOGLE_CX;

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
          query
        )}`
      );

      const data = await response.json();

      const results =
        data.items
          ?.slice(0, 3)
          .map((item: { title: string; snippet: string; link: string }) => ({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
          })) || [];

      return {
        results,
        query,
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        results: [],
        query,
        error: "Failed to perform search",
      };
    }
  },
});
export async function POST(req: Request) {
  const body = await req.json();
  const { messages, chatId } = body;

  console.log("Request body:", body); // Debug log to see what's being received

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a helpful AI assistant. You have access to web search . 
When a user asks for current information that you're not certain about, use the webSearch tool to find accurate information.
When providing information from web search, always cite your sources with the URLs.`,
    tools: {
      webSearch,
    },
    onFinish: async (completion) => {
      try {
        console.log("onFinish triggered, chatId:", chatId);

        if (!chatId) {
          console.error("No chatId provided, body:", body);
          return;
        }

        const text = completion.text || completion.toString();

        if (!text) {
          console.error("No text in completion");
          return;
        }

        await createMessage(chatId, text, "assistant");
        console.log("Assistant message saved successfully for chat:", chatId);
      } catch (error) {
        console.error("Error in onFinish:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
