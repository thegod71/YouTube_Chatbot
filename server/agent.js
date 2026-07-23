import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import data from "./data.js";

//console.log("Data:", data);
console.log("Video:", data[0]);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const agent = createReactAgent({ llm, tools: [] });

const results = await agent.invoke({
  messages: [{ role: "user", content: "Write a poem about a cat and a dog" }],
});
console.log(results.messages[1].content);
// 31.01
