import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`
});

export const {
  PORT,
  NODE_ENV,
  SERVER_URL,
  MONGO_URI,
  REDIS_URI,
  ARCJET_KEY,
  QSTASH_URL,
  QSTASH_TOKEN,
  QSTASH_CURRENT_SIGNING_KEY,
  QSTASH_NEXT_SIGNING_KEY,
  JWT_SECRET,
  JWT_EXPIRY,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS
} = process.env;