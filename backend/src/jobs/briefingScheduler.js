import cron from "node-cron";
import {
  DEFAULT_DEDUPE_THRESHOLD,
  DEFAULT_NEWS_LIMIT,
  generateNewsBriefing,
} from "../news/generateNewsBriefing.js";

const DEFAULT_SCHEDULE = "0 * * * *";

function readNumberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export function startBriefingScheduler() {
  const enabled = process.env.SCHEDULED_BRIEFINGS_ENABLED !== "false";

  if (!enabled) {
    console.log("Scheduled briefing generation is disabled.");
    return null;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "Scheduled briefing generation skipped: OPENAI_API_KEY is not configured."
    );
    return null;
  }

  const schedule = process.env.SCHEDULED_BRIEFINGS_CRON || DEFAULT_SCHEDULE;

  if (!cron.validate(schedule)) {
    console.warn(
      `Scheduled briefing generation skipped: invalid cron expression "${schedule}".`
    );
    return null;
  }

  const limit = readNumberEnv("SCHEDULED_BRIEFINGS_LIMIT", DEFAULT_NEWS_LIMIT);
  const threshold = readNumberEnv(
    "SCHEDULED_BRIEFINGS_THRESHOLD",
    DEFAULT_DEDUPE_THRESHOLD
  );
  const timezone = process.env.SCHEDULED_BRIEFINGS_TIMEZONE || "UTC";

  let isRunning = false;

  async function runScheduledGeneration() {
    if (isRunning) {
      console.log("Skipping scheduled briefing generation: previous run active.");
      return;
    }

    isRunning = true;

    try {
      const payload = await generateNewsBriefing({
        limit,
        threshold,
        refresh: true,
      });

      console.log(
        `Scheduled briefing generated at ${payload.generatedAt} with ${payload.totalStories} stories.`
      );
    } catch (error) {
      console.error("Scheduled briefing generation failed:", error);
    } finally {
      isRunning = false;
    }
  }

  const task = cron.schedule(schedule, runScheduledGeneration, {
    timezone,
  });

  console.log(
    `Scheduled briefing generation enabled (${schedule}, ${timezone}, limit ${limit}, threshold ${threshold}).`
  );

  if (process.env.SCHEDULED_BRIEFINGS_RUN_ON_STARTUP === "true") {
    setTimeout(runScheduledGeneration, 0);
  }

  return task;
}
