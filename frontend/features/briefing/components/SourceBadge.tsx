import { SOURCE_META, type SourceName } from "../sourceMeta";

export function SourceBadge({ source }: { source: string }) {
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
        // Source logos are remote SVG brand marks, so they intentionally bypass next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meta.logo}
          alt={meta.label}
          className="h-4 w-auto object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold" />
      )}

      <span>{meta.label}</span>
    </span>
  );
}
