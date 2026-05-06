import "dotenv/config";
import { createApp } from "./app.js";
import { startBriefingScheduler } from "./jobs/briefingScheduler.js";
import { connectRedis } from "./lib/redis.js";

const PORT = process.env.PORT || 4000;

async function startServer() {
  await connectRedis();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`News API running on http://localhost:${PORT}`);
  });

  startBriefingScheduler();
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
