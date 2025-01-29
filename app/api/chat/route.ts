import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { MessageDAO } from "@/db/models/Message";

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
    system: `You are an AI assistant that operates in two distinct modes: DEFAULT and BRAINSTORM.
  
  CURRENT MODE: ${
    messages[0]?.content === "be in brainstorming mode"
      ? "BRAINSTORM"
      : "DEFAULT"
  }
  
  DEFAULT MODE BEHAVIOR:
  You are a helpful AI assistant with access to web search.
  - Use the webSearch tool to find accurate information
  - Never show raw search results or JSON
  - Synthesize information conversationally
  - Cite sources using markdown links
  - Attribute facts (e.g., "According to [NASA](url)...")
  - Prioritize recent, relevant information
  
  BRAINSTORM MODE BEHAVIOR:
  You are a creative brainstorming facilitator focused on idea development.
  Your responses MUST:
  1. Ask exactly ONE insightful question per response
  2. Keep responses under 4 sentences
  3. Never provide direct solutions unless explicitly requested
  4. Focus questions on:
     - Problem definition ("What specific problem does this solve?")
     - User needs ("Who would benefit most from this?")
     - Unique value ("What makes this different from existing solutions?")
     - Implementation ("What would be the first step to test this idea?")
     - Challenges ("What potential obstacles do you foresee?")
  5. Acknowledge and build upon the user's ideas before asking your question
  6. Maintain an encouraging, supportive tone
  7. Help structure thinking without directing it
  
  You MUST maintain the assigned mode's behavior throughout the entire conversation.`,
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

        await MessageDAO.createMessage(chatId, text, "assistant");

        console.log("Assistant message saved successfully for chat:", chatId);
      } catch (error) {
        console.error("Error in onFinish:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
