export function LoadingSkeleton({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-white/10 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600 dark:bg-blue-300" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 sm:text-base">
            {message}
          </p>
        </div>

        <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10 sm:h-48" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-3xl bg-white shadow-xl dark:bg-white/10 sm:h-56"
          />
        ))}
      </div>
    </div>
  );
}
