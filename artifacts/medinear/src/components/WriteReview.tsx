import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview, getListReviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WriteReviewProps {
  doctorId?: number;
  shopId?: number;
  onSuccess?: () => void;
}

export default function WriteReview({ doctorId, shopId, onSuccess }: WriteReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!rating) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    createReview.mutate(
      { data: { rating, comment: comment.trim() || undefined, doctorId, shopId } },
      {
        onSuccess: () => {
          const key = doctorId
            ? getListReviewsQueryKey({ doctorId })
            : getListReviewsQueryKey({ shopId });
          queryClient.invalidateQueries({ queryKey: key });
          toast({ title: "Review submitted!", description: "Thank you for your feedback." });
          setRating(0);
          setComment("");
          onSuccess?.();
        },
        onError: () => {
          toast({ title: "Failed to submit review", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </div>
      <Textarea
        placeholder="Share your experience (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="resize-none"
      />
      <Button
        onClick={handleSubmit}
        disabled={!rating || createReview.isPending}
        size="sm"
      >
        {createReview.isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}
