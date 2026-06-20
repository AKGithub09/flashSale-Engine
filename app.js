import express from "express";
import cors from "cors";
import flashSaleRouter from "./routes/flashSale.route.js";
import authRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import { handleQStashWebhook } from "./controllers/webhook.controller.js";


export const app = express();
app.use(cors());
app.use(cookieParser());

// 1. PLACE THE WEBHOOK ROUTE HERE (Before express.json())
// This catches the raw binary JSON stream before Express alters it.
app.post(
  "/api/v1/auth/webhook/send-email", 
  express.raw({ type: "application/json" }), 
  handleQStashWebhook
);

app.use(express.json());

//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/flashSale', flashSaleRouter)

