/**
 * Skeleton loader for notifications
 */
export default function NotificationSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2 py-0.5">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-1/4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
