import express from "express";
import Cors from "cors";
import dotenv from "dotenv";
import { agent } from "./agent.js";

dotenv.config();
const app = express();
app.use(Cors());
app.use(express.json()); // it automatically parses incoming JSON requests and convert all the
// jo bhi request aa rha hain ya middleware ka jayse kam krta hain wo sn request ko json formate
// may kr deyta hain .

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const PORT = process.env.PORT || 3000;

app.post("/generate", async (req, res) => {
  const { query, video_id, thread_id } = req.body;
  console.log("Received query:", query);
  console.log("Received video ID:", video_id);
  console.log("Received thread ID:", thread_id);

  const results = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    },
    { configurable: { thread_id, video_id } },
  );
  console.log(results.messages.at(-1).content);

  // Your code to handle the POST request and generate a response
  res.json(results.messages.at(-1).content);
});

app.post("/webhook", (req, res) => {
  console.log("Received webhook request:", req.body);
  res.status(200).send("Webhook received");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// to restart the server again and again after maming changes we can use node --watch index.js command in the terminal.This will automatically restart the server whenever changes are made to the index.js file.
