import { generateBriefing } from "../briefing/generateBriefing.js";
import { redis } from "../lib/redis.js";
import { deduplicateStories } from "./deduplicateStories.js";
import { fetchAllNews } from "./fetchNews.js";

export const DEFAULT_NEWS_LIMIT = Number(process.env.DEFAULT_NEWS_LIMIT || 5);
export const DEFAULT_DEDUPE_THRESHOLD = Number(
  process.env.DEFAULT_DEDUPE_THRESHOLD || 0.55
);

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 1800);

export function getCacheKey({ limit, threshold }) {
  return `news:${limit}:${threshold}`;
}

export async function generateNewsBriefing({
  limit = DEFAULT_NEWS_LIMIT,
  threshold = DEFAULT_DEDUPE_THRESHOLD,
  refresh = false,
} = {}) {
  const cacheKey = getCacheKey({ limit, threshold });

  if (!refresh) {
    const cached = await redis.get(cacheKey);

    if (cached) {
      return {
        ...JSON.parse(cached),
        cached: true,
      };
    }
  }

  const newsBySource = await fetchAllNews(limit);
  const stories = deduplicateStories(newsBySource, threshold);
  const summary = await generateBriefing(stories);

  const payload = {
    generatedAt: new Date().toISOString(),
    cached: false,
    sources: newsBySource.map((source) => ({
      source: source.source,
      articleCount: source.articles.length,
      error: source.error || null,
    })),
    totalStories: stories.length,
    summary,
    stories,
    rawSources: newsBySource,
  };

  await redis.set(cacheKey, JSON.stringify(payload), {
    EX: CACHE_TTL_SECONDS,
  });

  return payload;
}
