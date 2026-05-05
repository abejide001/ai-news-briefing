"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { getReadingTime } from "@/lib/utils/getReadingTime";
import type { Story } from "../types";
import { SourceBadge } from "./SourceBadge";

type StoryCardProps = {
  story: Story;
  index: number;
  isRead: boolean;
  onToggleRead: () => void;
};

export function StoryCard({
  story,
  index,
  isRead,
  onToggleRead,
}: StoryCardProps) {
  const readingTime = getReadingTime(
    [story.title, ...(story.links ?? []).map((link) => link.title)].join(" ")
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`min-w-0 rounded-3xl border p-4 shadow-xl transition hover:-translate-y-1 sm:p-5 ${
        isRead
          ? "border-slate-200 bg-slate-50 opacity-75 hover:bg-slate-100 dark:border-white/5 dark:bg-white/[0.06] dark:backdrop-blur dark:hover:bg-white/10"
          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:backdrop-blur dark:hover:bg-white/[0.13]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={`break-words text-lg font-semibold leading-7 sm:text-xl ${
              isRead ? "text-slate-500 dark:text-slate-400" : ""
            }`}
          >
            {story.title}
          </h3>

          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {readingTime.minutes} min read
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleRead}
          aria-pressed={isRead}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
            isRead
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
          }`}
        >
          {isRead ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          <span>{isRead ? "Read" : "Unread"}</span>
        </button>
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
