import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
dotenv.config();

import data from "./data.js";

import { Document } from "@langchain/core/documents";
import { ChatGroq } from "@langchain/groq";

import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { vectorStore, addYTVideoToVectorStore } from "./embeddings.js";

// //console.log("Data:", data);
// console.log("Video:", data[0]);

const video = data[0];

await addYTVideoToVectorStore(video);

const retrievetool = tool(
  async ({ query }, { configurable: { video_id } }) => {
    console.log("Tool Query:", query);
    console.log("Tool Video ID:", video_id);
    const result = await vectorStore.similaritySearch(query, 5, {
      video_id,
    });
    return result.map((doc) => doc.pageContent).join("\n");
  },
  {
    name: "retrieve",
    description: `You are a transcript search assistant. Given a transcript and a user's query, find and return the most relevant excerpt(s) from the transcript that best answer or match the query.

1=>Return only the relevant text, word-for-word from the transcript.

2=>Keep the excerpt concise but complete.

3=>If nothing relevant is found, say: "No relevant content found for this query."`,
    schema: z.object({
      query: z.string(),
    }),
  },
);

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
});
// const llm = new ChatGoogleGenerativeAI({
//   model: "gemini-3.6-flash",
//   apiKey: process.env.GOOGLE_API_KEY,
// });

const memory = new MemorySaver();

export const agent = createReactAgent({
  llm,
  tools: [retrievetool],
  checkpoint: memory,
});
