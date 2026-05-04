import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BriefingAudioControls } from "./BriefingAudioControls";

export function SummaryCard({ summary }: { summary: string }) {
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
