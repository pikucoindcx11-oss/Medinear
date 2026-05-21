import { Badge } from "@/components/ui/badge";

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  processing: { label: "Processing", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>;
}
