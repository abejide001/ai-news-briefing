"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getReadingTime } from "@/lib/utils/getReadingTime";
import type { Story } from "../types";
import { SourceBadge } from "./SourceBadge";

export function StoryCard({ story, index }: { story: Story; index: number }) {
  const readingTime = getReadingTime(
    [story.title, ...(story.links ?? []).map((link) => link.title)].join(" ")
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
