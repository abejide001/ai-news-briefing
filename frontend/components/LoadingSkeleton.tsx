export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 animate-pulse rounded-3xl bg-white shadow-xl dark:bg-white/10 sm:h-64" />

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
