import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import data from "./data.js";
``;
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";

import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

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

const result = await vectorStore.similaritySearch(
  "What is the  topic of video?",
  1,
);

console.log("Result:", result);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const agent = createReactAgent({ llm, tools: [] });

// const results = await agent.invoke({
//   messages: [{ role: "user", content: "Write a poem about a cat and a dog" }],
// });
// console.log(results.messages[1].content);
// 46
