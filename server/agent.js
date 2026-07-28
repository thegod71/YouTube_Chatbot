import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import data from "./data.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
//import { MemorySaver } from "@langchain/langgraph";
// //console.log("Data:", data);
// console.log("Video:", data[0]);

const video = data[0];

const docs = [
  new Document({
    pageContent: video.transcript,
    metadata: { video_id: video.video_id },
  }),
];

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await textSplitter.splitDocuments(docs);

//console.log("Chunks:", chunks);

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "BAAI/bge-base-en-v1.5",
});

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(chunks);

//console.log("Result:", result);

const retrievetool = tool(
  async ({ query }) => {
    console.log("Tool Query:", query);
    const result = await vectorStore.similaritySearch(query, 10);
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

//const memory = new MemorySaver();

const agent = createReactAgent({
  llm,
  tools: [retrievetool],
  // checkpoint: memory,
});

const results = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What is the main topic of the video?",
    },
  ],
});
console.log(results.messages.at(-1).content);

// 46
