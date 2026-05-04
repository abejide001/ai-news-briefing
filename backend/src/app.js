import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { newsRouter } from "./routes/newsRoutes.js";

export function createApp() {
  const app = express();

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
  });

  app.use("/api/", limiter);
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
    })
  );

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "ai-news-briefing-api",
    });
  });

  app.use("/api", newsRouter);

  return app;
}
