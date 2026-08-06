import dotenv from "dotenv";

dotenv.config();
const brightDataTriggerUrl = "https://api.brightdata.com/datasets/v3/trigger";

const webhookUrl = process.env.WEBHOOK_URL; // Replace with your actual webhook URL

export const triggerYoutubeVideoScrape = async (url) => {
  const data = JSON.stringify([
    { url: url, country: "", transcription_language: "" },
  ]);
  console.log(process.env.BRIGHTDATA_API_KEY);
  const respons = await fetch(
    `${brightDataTriggerUrl}?dataset_id=gd_lk56epmy2i5g7lzu0k&endpoint=${webhookUrl}&format=json&uncompressed_webhook=true&include_errors=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: data,
    },
  );

  const result = await respons.json();
  console.log(result);
};

triggerYoutubeVideoScrape("https://www.youtube.com/watch?v=fuhE6PYnRMc");
