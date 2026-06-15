import { STATUS_LABELS, type GenerationStatus } from "@/lib/aiCourses";

export function AIGenerationStatusPill({ status }: { status: GenerationStatus }) {
  const map: Record<GenerationStatus, string> = {
    draft: "bg-muted text-muted-foreground",
    generated: "bg-primary/10 text-primary",
    converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    archived: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    failed: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-[11px] rounded-full px-2 py-0.5 ${map[status]}`}>{STATUS_LABELS[status]}</span>;
}