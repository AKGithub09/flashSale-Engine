// controllers/webhook.controller.js
import { Receiver } from "@upstash/qstash";
import { dispatchEmail } from "../utils/email.utils.js";
import { QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY } from "../config/envConfig.js";

// Initialize the Upstash QStash security verifier signature signature card
const qstashReceiver = new Receiver({
  currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
});

export const handleQStashWebhook = async (req, res) => {
 try {
    console.log("📥 Webhook Endpoint Successfully Hit!");
    
    let parsedData;

    // Robust parsing checking both raw buffers and standard objects/strings
    if (Buffer.isBuffer(req.body)) {
      parsedData = JSON.parse(req.body.toString("utf-8"));
    } else if (typeof req.body === "string") {
      parsedData = JSON.parse(req.body);
    } else {
      parsedData = req.body; // already parsed object fallback
    }
    
    console.log("📦 Fully Parsed Payload Body:", parsedData);

    const { to, subject, body } = parsedData;

    if (!to || !body) {
      console.log("⚠️ Webhook received an incomplete or empty payload block.");
      return res.status(400).json({ success: false, error: "Missing payload details." });
    }

    console.log(`✉️ Handing off email delivery to Mailtrap for: ${to}`);
    await dispatchEmail(to, subject, body);

    return res.status(200).json({ 
      success: true, 
      message: "Webhook processed and email dispatched successfully." 
    });
  } catch (err) {
    console.error("❌ Webhook internal processing error caught:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};