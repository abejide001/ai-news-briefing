"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock, RefreshCw, Search } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatTime, timeAgo } from "@/lib/utils/formatGeneratedAt";
import { StoryCard } from "./components/StoryCard";
import { SummaryCard } from "./components/SummaryCard";
import type { NewsResponse, Story } from "./types";

const READ_STORIES_STORAGE_KEY = "ai-news-briefing:read-stories";
const LOADING_STAGE_DELAY_MS = 1200;
const TOPICS = [
  "All",
  "Politics",
  "Business",
  "Climate",
  "Science",
  "Sports",
  "Technology",
] as const;

type Topic = (typeof TOPICS)[number];

const TOPIC_KEYWORDS: Record<Exclude<Topic, "All">, string[]> = {
  Politics: [
    "election",
    "government",
    "minister",
    "president",
    "parliament",
    "senate",
    "congress",
    "policy",
    "diplomacy",
    "war",
    "ceasefire",
    "sanction",
    "court",
  ],
  Business: [
    "business",
    "market",
    "stock",
    "economy",
    "inflation",
    "trade",
    "company",
    "bank",
    "earnings",
    "finance",
    "investment",
    "tariff",
  ],
  Climate: [
    "climate",
    "weather",
    "warming",
    "emissions",
    "carbon",
    "flood",
    "wildfire",
    "storm",
    "renewable",
    "environment",
    "drought",
  ],
  Science: [
    "science",
    "research",
    "space",
    "nasa",
    "health",
    "medical",
    "study",
    "vaccine",
    "physics",
    "biology",
    "discovery",
  ],
  Sports: [
    "sport",
    "football",
    "soccer",
    "basketball",
    "tennis",
    "cricket",
    "olympic",
    "match",
    "league",
    "championship",
    "tournament",
  ],
  Technology: [
    "technology",
    "tech",
    "software",
    "startup",
    "chip",
    "semiconductor",
    "cyber",
    "data",
    "app",
    "device",
    "robot",
  ],
};

function getStoryText(story: Story) {
  return [
    story.title,
    ...(story.sources || []),
    ...(story.links || []).map((link) => link.title),
    ...(story.links || []).map((link) => link.source),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesTopic(story: Story, topic: Topic) {
  if (topic === "All") return true;

  const storyText = getStoryText(story);
  return TOPIC_KEYWORDS[topic].some((keyword) => {
    if (keyword.length <= 3) {
      return new RegExp(`\\b${keyword}\\b`, "i").test(storyText);
    }

    return storyText.includes(keyword);
  });
}

function getStoryId(story: Story) {
  const linkIds = (story.links || []).map((link) => link.link).join("|");
  return `${story.title}|${linkIds}`;
}

export function BriefingPage() {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [limit, setLimit] = useState(5);
  const [aiEnabled] = useState(true);
  const [refreshCache] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [selectedTopic, setSelectedTopic] = useState<Topic>("All");
  const [readStoryIds, setReadStoryIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();

    const storedReadStories = window.localStorage.getItem(
      READ_STORIES_STORAGE_KEY
    );

    if (!storedReadStories) return new Set();

    try {
      const storyIds = JSON.parse(storedReadStories);
      return Array.isArray(storyIds)
        ? new Set(storyIds.filter(Boolean))
        : new Set();
    } catch {
      window.localStorage.removeItem(READ_STORIES_STORAGE_KEY);
      return new Set();
    }
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Fetching feeds");
  const [error, setError] = useState("");

  const fetchNews = useCallback(async () => {
    const summaryStageTimeout = window.setTimeout(() => {
      setLoadingMessage("Generating summary");
    }, LOADING_STAGE_DELAY_MS);

    try {
      setLoadingMessage("Fetching feeds");
      setLoading(true);
      setError("");

      const apiUrl = process.env.NEXT_PUBLIC_NEWS_API_URL;

      if (!apiUrl) {
        throw new Error("Missing NEXT_PUBLIC_NEWS_API_URL");
      }

      const params = new URLSearchParams({
        limit: String(limit),
        ai: String(aiEnabled),
      });

      if (refreshCache) {
        params.set("refresh", "true");
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch news briefing");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      window.clearTimeout(summaryStageTimeout);
      setLoading(false);
    }
  }, [aiEnabled, limit, refreshCache]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNews();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchNews]);

  const sources = useMemo(() => {
    const allSources =
      data?.stories?.flatMap((story) => story.sources || []) || [];

    return ["All", ...new Set(allSources)];
  }, [data]);

  const filteredStories = useMemo(() => {
    const stories = data?.stories || [];
    const query = search.trim().toLowerCase();

    return stories.filter((story) => {
      const matchesSource =
        selectedSource === "All" || story.sources?.includes(selectedSource);
      const matchesSearch = !query || getStoryText(story).includes(query);

      return matchesSource && matchesSearch && matchesTopic(story, selectedTopic);
    });
  }, [data, selectedSource, selectedTopic, search]);

  function toggleReadStory(storyId: string) {
    setReadStoryIds((currentStoryIds) => {
      const nextStoryIds = new Set(currentStoryIds);

      if (nextStoryIds.has(storyId)) {
        nextStoryIds.delete(storyId);
      } else {
        nextStoryIds.add(storyId);
      }

      window.localStorage.setItem(
        READ_STORIES_STORAGE_KEY,
        JSON.stringify([...nextStoryIds])
      );

      return nextStoryIds;
    });
  }

  const visibleReadCount = filteredStories.filter((story) =>
    readStoryIds.has(getStoryId(story))
  ).length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-6 text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_45%)] dark:text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 sm:mb-10">
          {data?.generatedAt && (
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />

              <span>
                Updated {timeAgo(data.generatedAt)} ·{" "}
                {formatTime(data.generatedAt)}
              </span>
            </div>
          )}

          <div className="mb-5 flex items-center justify-between gap-4">
            <ThemeToggle />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
                Today&apos;s top stories, summarized.
              </h1>
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-white/10 dark:shadow-2xl dark:backdrop-blur sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[180px_1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
                Articles per source
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950/70 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
                Search stories
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/70">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search headlines..."
                  className="min-w-0 w-full bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1 lg:w-auto"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-sm text-slate-600 dark:text-slate-300">
              Topics
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    selectedTopic === topic
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-950/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100 sm:p-5 sm:text-base">
            <AlertCircle className="shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {loading && <LoadingSkeleton message={loadingMessage} />}

        {data && !loading && (
          <div className="space-y-8">
            <SummaryCard summary={data.summary} />

            <section>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Story groups</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                    {filteredStories.length} of {data.stories?.length || 0}{" "}
                    stories shown · {selectedTopic} · {visibleReadCount} read
                  </p>
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {sources.map((source) => (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                        selectedSource === source
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              {filteredStories.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-xl dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:backdrop-blur">
                  No stories match your search.
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredStories.map((story, index) => {
                    const storyId = getStoryId(story);

                    return (
                      <StoryCard
                        key={storyId}
                        story={story}
                        index={index}
                        isRead={readStoryIds.has(storyId)}
                        onToggleRead={() => toggleReadStory(storyId)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
