import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { Message } from "@/db/models/Message";

export const maxDuration = 30;

const webSearch = tool({
  description:
    "Search the web for current information. Also search when information requested needs to be accurate and up to date",
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

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a helpful AI assistant with access to web search.
When searching for current information:
1. Use the webSearch tool to find accurate information
2. NEVER show the raw search results or JSON to the user
3. Synthesize the information into a natural, conversational response
4. Always cite sources using markdown links in your explanation
5. For each fact, mention where it's from, like: "According to [NASA](url)..."
6. Focus on providing the most relevant and recent information first`,
    tools: {
      webSearch,
    },
    maxSteps: 5,
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

        await Message.createMessage(chatId, text, "assistant");

        console.log("Assistant message saved successfully for chat:", chatId);
      } catch (error) {
        console.error("Error in onFinish:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
