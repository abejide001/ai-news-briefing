"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Clock,
  Search,
} from "lucide-react";

type SourceName = keyof typeof SOURCE_META;

type SourceBadgeProps = {
  source: string;
};

const SOURCE_META = {
  BBC: {
    label: "BBC",
    color: "bg-red-600 text-white",
    logo: "BBC",
  },
  CNN: {
    label: "CNN",
    color: "bg-red-500 text-white",
    logo: "CNN",
  },
  "Sky News": {
    label: "Sky News",
    color: "bg-blue-600 text-white",
    logo: "SKY",
  },
  "Al Jazeera": {
    label: "Al Jazeera",
    color: "bg-yellow-500 text-black",
    logo: "AJ",
  },
  Reuters: {
    label: "Reuters",
    color: "bg-orange-500 text-white",
    logo: "R",
  },
  "The Guardian": {
    label: "The Guardian",
    color: "bg-indigo-700 text-white",
    logo: "G",
  },
  "Associated Press": {
    label: "Associated Press",
    color: "bg-gray-800 text-white",
    logo: "AP",
  },
  "Deutsche Welle": {
    label: "Deutsche Welle",
    color: "bg-blue-800 text-white",
    logo: "DW",
  },
};
function SourceBadge({ source }: SourceBadgeProps) {
  const meta = SOURCE_META[source as SourceName] || {
    label: source,
    color: "bg-white/10 text-slate-300",
    logo: source?.slice(0, 2)?.toUpperCase() || "?",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}
      title={meta.label}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-black leading-none">
        {meta.logo}
      </span>
      <span>{meta.label}</span>
    </span>
  );
}

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [limit, setLimit] = useState(5);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [refreshCache, setRefreshCache] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchNews() {
    try {
      setLoading(true);
      setError("");

      const apiUrl = process.env.NEXT_PUBLIC_NEWS_API_URL;

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
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  const sources = useMemo(() => {
    const allSources =
      data?.stories?.flatMap((story: any) => story.sources || []) || [];

    return ["All", ...new Set(allSources)];
  }, [data]);

  const filteredStories = useMemo(() => {
    const stories = data?.stories || [];
    const query = search.trim().toLowerCase();

    return stories.filter((story: any) => {
      const matchesSource =
        selectedSource === "All" || story.sources?.includes(selectedSource);

      const searchableText = [
        story.title,
        ...(story.sources || []),
        ...(story.links || []).map((link: any) => link.title),
        ...(story.links || []).map((link: any) => link.source),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesSource && matchesSearch;
    });
  }, [data, selectedSource, search]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_#1e3a8a,_#020617_45%)] px-4 py-6 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 sm:mb-10">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-blue-100 backdrop-blur sm:text-sm">
            <Sparkles size={16} className="shrink-0" />
            <span className="truncate">AI-powered daily news briefing</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
                Today’s top stories, summarized.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:mt-5 sm:text-lg sm:leading-8">
                Fetches news from multiple outlets, deduplicates overlapping
                stories, and generates a concise AI briefing with source links.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur sm:p-5">
              <div className="flex items-center gap-3">
                <Newspaper className="shrink-0 text-blue-300" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-300">Briefing status</p>
                  <p className="truncate font-semibold">
                    {data?.cached ? "Loaded from cache" : "Fresh briefing"}
                  </p>
                </div>
              </div>

              {data?.generatedAt && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                  <Clock size={16} className="shrink-0" />
                  <span className="break-words">
                    {new Date(data.generatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[180px_1fr_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Articles per source
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Search stories
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
                <Search size={18} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search headlines..."
                  className="min-w-0 w-full bg-transparent outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-1 lg:w-auto"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
              />
              AI summary
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={refreshCache}
                onChange={(e) => setRefreshCache(e.target.checked)}
              />
              Force refresh cache
            </label>
          </div>
        </section>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/50 p-4 text-sm text-red-100 sm:p-5 sm:text-base">
            <AlertCircle className="shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {data && !loading && (
          <div className="space-y-8">
            <SummaryCard summary={data.summary} />

            <section>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Story groups</h2>
                  <p className="text-sm text-slate-400 sm:text-base">
                    {filteredStories.length} of {data.stories?.length || 0}{" "}
                    stories shown
                  </p>
                </div>

                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {sources.map((source: any) => (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                        selectedSource === source
                          ? "bg-blue-500 text-white"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              {filteredStories.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-300 backdrop-blur">
                  No stories match your search.
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                  {filteredStories.map((story: any, index: any) => (
                    <StoryCard
                      key={`${story.title}-${index}`}
                      story={story}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ summary }: any) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-2xl backdrop-blur sm:p-6">
      <div className="prose prose-invert max-w-none break-words text-sm sm:text-base">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="mb-4 leading-7 sm:leading-8 text-slate-300">
                {children}
              </p>
            ),
            h3: ({ children }) => (
              <h3 className="mt-6 mb-3 text-lg font-semibold text-white">
                {children}
              </h3>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc space-y-2 pl-5 text-slate-300">
                {children}
              </ul>
            ),
            li: ({ children }) => <li>{children}</li>,
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline underline-offset-4 hover:text-blue-200"
              >
                {children}
              </a>
            ),
          }}
        >
          {summary}
        </ReactMarkdown>
      </div>
    </section>
  );
}

function StoryCard({ story, index }: any) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="min-w-0 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.13] sm:p-5"
    >
      <h3 className="break-words text-lg font-semibold leading-7 sm:text-xl">
        {story.title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {story.sources?.map((source: any) => (
          <SourceBadge key={source} source={source} />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {story.links?.map((item: any, linkIndex: any) => (
          <a
            key={`${item.link}-${linkIndex}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
          >
            <div className="min-w-0">
              <div className="mb-2">
                <SourceBadge source={item.source} />
              </div>

              <span className="block break-words">{item.title}</span>
            </div>

            <ExternalLink
              size={16}
              className="mt-1 shrink-0 text-slate-500 transition group-hover:text-blue-300"
            />
          </a>
        ))}
      </div>
    </motion.article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 animate-pulse rounded-3xl bg-white/10 sm:h-64" />

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-3xl bg-white/10 sm:h-56"
          />
        ))}
      </div>
    </div>
  );
}
