"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Search,
  Moon,
  Sun,
  Newspaper,
  Clock,
} from "lucide-react";
import { LoadingSkeleton } from "./loadingSkeletion";
import { BriefingAudioControls } from "./briefingAudioControls";
import { formatGeneratedAt } from "@/lib/formatGeneratedAt";

type NewsLink = {
  source: string;
  title: string;
  link: string;
};

type Story = {
  title: string;
  sources?: string[];
  links?: NewsLink[];
};

type NewsResponse = {
  summary: string;
  stories?: Story[];
  cached?: boolean;
  generatedAt?: string;
};

function getReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  return {
    minutes,
  };
}

const SOURCE_META = {
  BBC: {
    label: "BBC",
    color: "bg-white text-black",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_Logo_2021.svg",
  },
  CNN: {
    label: "CNN",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
  },
  "Sky News": {
    label: "Sky News",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/en/archive/5/57/20231116033322%21Sky_News_logo.svg",
  },
  "Al Jazeera": {
    label: "Al Jazeera",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/en/f/f2/Aljazeera_eng.svg",
  },
  "Deutsche Welle": {
    label: "DW",
    color: "bg-white",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Deutsche_Welle_Logo.svg",
  },
} as const;

type SourceName = keyof typeof SOURCE_META;

export default function HomePage() {
  const [data, setData] = useState<NewsResponse | null>(null);
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
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

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

      const searchableText = [
        story.title,
        ...(story.sources || []),
        ...(story.links || []).map((link) => link.title),
        ...(story.links || []).map((link) => link.source),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesSource && matchesSearch;
    });
  }, [data, selectedSource, search]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-100 px-4 py-6 text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top,_#1e293b,_#020617_45%)] dark:text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-100 backdrop-blur">
            <Sparkles size={16} />
            AI-powered daily news briefing
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                Today’s top stories, summarized.
              </h1>
            </div>

            <div className="bg-background border border-border rounded-xl p-5 flex flex-col gap-3 transition-colors hover:border-border/70">

  {/* Header */}
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950">
      <Newspaper size={16} className="text-blue-600 dark:text-blue-400" />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-0.5">
        Briefing status
      </p>
      <p className="text-sm font-medium">Today's briefing</p>
    </div>
  </div>


  <div className="h-px bg-border" />


  {data?.generatedAt && (
    <div className="flex items-center gap-1.5">
      <Clock size={13} className="text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">
        {formatGeneratedAt(data.generatedAt)}
      </span>
    </div>
  )}
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
                onChange={(e) => setLimit(Number(e.target.value))}
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
                  onChange={(e) => setSearch(e.target.value)}
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

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"></div>
        </section>

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/50 dark:text-red-100 sm:p-5 sm:text-base">
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
                  <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                    {filteredStories.length} of {data.stories?.length || 0}{" "}
                    stories shown
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
                  {filteredStories.map((story, index) => (
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

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-10 w-24 rounded-full border border-slate-200 bg-white dark:border-white/10 dark:bg-white/10" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:backdrop-blur dark:hover:bg-white/20"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

function SummaryCard({ summary }: { summary: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-2xl dark:backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="shrink-0 rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
          <Sparkles size={22} />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold sm:text-2xl">AI Summary</h2>
        </div>
      </div>
      <BriefingAudioControls text={summary} />
      <div className="space-y-6 text-base leading-8 text-slate-700 dark:text-slate-300 sm:text-lg sm:leading-9">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2 className="mt-8 text-2xl font-bold text-slate-950 dark:text-white">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-8 text-xl font-bold text-slate-950 dark:text-white">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-6 max-w-4xl leading-8 sm:leading-9">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-8 list-disc space-y-4 pl-6">{children}</ul>
            ),
            li: ({ children }) => (
              <li className="pl-2 leading-8 sm:leading-9">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-950 dark:text-white">
                {children}
              </strong>
            ),
            hr: () => (
              <hr className="my-8 border-slate-200 dark:border-white/20" />
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
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

function StoryCard({ story, index }: { story: Story; index: number }) {
  const readingTime = getReadingTime(
    [story.title, ...(story.links ?? []).map((l) => l.title)].join(" ")
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl transition hover:-translate-y-1 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:backdrop-blur dark:hover:bg-white/[0.13] sm:p-5"
    >
      <h3 className="break-words text-lg font-semibold leading-7 sm:text-xl">
        {story.title}
      </h3>

      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {readingTime.minutes} min read
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {story.sources?.map((source) => (
          <SourceBadge key={source} source={source} />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {story.links?.map((item, linkIndex) => (
          <a
            key={`${item.link}-${linkIndex}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10 dark:hover:text-white"
          >
            <div className="min-w-0">
              <div className="mb-2">
                <SourceBadge source={item.source} />
              </div>

              <span className="block break-words">{item.title}</span>
            </div>

            <ExternalLink
              size={16}
              className="mt-1 shrink-0 text-slate-400 transition group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-300"
            />
          </a>
        ))}
      </div>
    </motion.article>
  );
}

function SourceBadge({ source }: { source: string }) {
  const meta = SOURCE_META[source as SourceName] || {
    label: source,
    color: "bg-slate-200 text-slate-800 dark:bg-white/10 dark:text-slate-300",
    logo: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.color}`}
      title={meta.label}
    >
      {meta.logo ? (
        <img
          src={meta.logo}
          alt={meta.label}
          className="h-4 w-auto object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold">
          {/* {meta.label.slice(0, 2).toUpperCase()} */}
        </span>
      )}

      <span>{meta.label}</span>
    </span>
  );
}
