import dotenv from "dotenv";
dotenv.config();
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import data from "./data.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACEHUB_API_KEY,
  model: "BAAI/bge-base-en-v1.5",
});

export const vectorStore = await PGVectorStore.initialize(embeddings, {
  postgresConnectionOptions: {
    connectionString: process.env.DB_URL,
  },
  tableName: "transcripts",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "text",
    metaColumnName: "metadata",
  },
  distanceStrategy: "cosine", // it means that the similarity between two vectors is measured by the cosine of the angle between them. A smaller angle (closer to 0 degrees) indicates higher similarity, while a larger angle (closer to 90 degrees) indicates lower similarity.
});

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
