import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.WABA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WABA_PHONE_NUMBER_ID;

export async function sendText(to, text) {
  const url = `https://graph.facebook.com/v16.0/${PHONE_NUMBER_ID}/messages?access_token=${TOKEN}`;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Send message failed", data);
    throw new Error("Failed to send message");
  }
  return data;
}
