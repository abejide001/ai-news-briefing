import { Router } from "express";
import {
  DEFAULT_DEDUPE_THRESHOLD,
  DEFAULT_NEWS_LIMIT,
  generateNewsBriefing,
} from "../news/generateNewsBriefing.js";

export const newsRouter = Router();

newsRouter.get("/news", async (req, res) => {
  try {
    const limit = Number(req.query.limit || DEFAULT_NEWS_LIMIT);
    const threshold = Number(req.query.threshold || DEFAULT_DEDUPE_THRESHOLD);
    const refresh = req.query.refresh === "true";

    if (!Number.isFinite(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({
        error: "limit must be a number between 1 and 20",
      });
    }

    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      return res.status(400).json({
        error: "threshold must be a number between 0 and 1",
      });
    }

    const payload = await generateNewsBriefing({
      limit,
      threshold,
      refresh,
    });

    res.json(payload);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate news briefing",
      message: error.message,
    });
  }
});
