// services/email.service.js
import nodemailer from "nodemailer";
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } from "../config/envConfig.js";

// Initialize the Nodemailer carrier transport layer using your Mailtrap configuration
const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: parseInt(MAIL_PORT) || 2525,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export const dispatchEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: '"FlashSale Admin" <no-reply@flashsaleengine.com>',
      to,
      subject,
      text,
    });
    console.log(`✅ Email delivered to Mailtrap Sandbox. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Nodemailer SMTP delivery pipeline failed:", error);
    throw error;
  }
};