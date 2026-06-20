// utils/qstash.utils.js
import { Client } from "@upstash/qstash";
import { QSTASH_TOKEN, SERVER_URL, QSTASH_URL } from "../config/envConfig.js";

// Initialize the official Upstash QStash client SDK wrapper
const qstashClient = new Client({
  baseUrl: QSTASH_URL,
  token: QSTASH_TOKEN,
});

export const sendQStashEmail = async (toEmail, subject, textContent) => {
  try {
    // Determine the inbound endpoint lane (targeting your active localtunnel domain)
    const webhookDestination = `http://127.0.0.1:8000/api/v1/auth/webhook/send-email`;

    // Publish securely via the SDK wrapper
    const result = await qstashClient.publishJSON({
      url: webhookDestination,
      body: {
        to: toEmail,
        subject: subject,
        body: textContent,
      },
      headers: {
        "Bypass-Tunnel-Reminder": "true", // Tells localtunnel to bypass its warning screen
      }
    });

    console.log(`🚀 QStash successfully enqueued job! Message ID: ${result.messageId}`);
  } catch (err) {
    console.error("❌ Failed to forward payload to QStash pipeline:", err);
    throw err; // Pass up to the controller transaction block
  }
};