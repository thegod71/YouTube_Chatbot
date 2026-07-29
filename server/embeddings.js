import dotenv from "dotenv";
dotenv.config();
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import data from "./data.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "BAAI/bge-base-en-v1.5",
});

export const vectorStore = new MemoryVectorStore(embeddings);

export const addYTVideoToVectorStore = async (videoData) => {
  const { video_id, transcript } = videoData;

  const docs = [
    new Document({
      pageContent: transcript,
      metadata: { video_id: video_id },
    }),
  ];

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await textSplitter.splitDocuments(docs);
  await vectorStore.addDocuments(chunks);
};
