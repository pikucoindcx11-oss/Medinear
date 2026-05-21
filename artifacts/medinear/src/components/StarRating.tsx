import { Star } from "lucide-react";

interface Props {
  rating: number | null | undefined;
  count?: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, count, size = "sm" }: Props) {
  const r = rating ?? 0;
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${starSize} ${i <= Math.round(r) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      {r > 0 && <span className="text-xs text-muted-foreground">{r.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}
