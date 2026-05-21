import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Phone, Clock, ExternalLink, ArrowLeft, Stethoscope, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGetShop, useListShopDoctors, useListReviews, getGetShopQueryKey } from "@workspace/api-client-react";
import StarRating from "@/components/StarRating";
import WriteReview from "@/components/WriteReview";
import { useAuth } from "@workspace/replit-auth-web";

export default function ShopDetail({ id }: { id: number }) {
  const { data: shop, isLoading } = useGetShop(id, { query: { queryKey: getGetShopQueryKey(id) } });
  const { data: doctors } = useListShopDoctors(id);
  const { data: reviews } = useListReviews({ shopId: id });
  const { isAuthenticated, login } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!shop) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">Shop not found</p>
      <Link href="/shops"><Button variant="outline" className="mt-4">Back to Shops</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/shops">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Shops
        </Button>
      </Link>

      {/* Shop info */}
      <Card className="overflow-hidden">
        {shop.imageUrl && (
          <div className="h-56 bg-muted overflow-hidden">
            <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <StarRating rating={shop.rating} count={shop.reviewCount} size="md" />
            </div>
            <Badge variant={shop.isOpen ? "default" : "secondary"} className={shop.isOpen ? "bg-emerald-500 text-white" : ""}>
              {shop.isOpen ? "Open Now" : "Closed"}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
              <a href={`tel:${shop.phone}`} className="hover:text-primary">{shop.phone}</a>
            </div>
            {shop.openingTime && shop.closingTime && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 flex-shrink-0 text-primary" />
                <span>{shop.openingTime} – {shop.closingTime}</span>
              </div>
            )}
          </div>
          {shop.lat && shop.lng && (
            <a href={`https://maps.google.com/?q=${shop.lat},${shop.lng}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex">
              <Button variant="outline" size="sm" className="flex items-center gap-2" data-testid="button-maps">
                <ExternalLink className="w-4 h-4" /> View on Google Maps
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* Available doctors */}
      {doctors && doctors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Available Doctors ({doctors.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {doctors.map((doctor) => (
              <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer" data-testid={`card-doctor-${doctor.id}`}>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                    {doctor.photoUrl
                      ? <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Stethoscope className="w-5 h-5 text-primary" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{doctor.name}</h4>
                    <p className="text-xs text-primary font-medium">{doctor.specialization}</p>
                    <p className="text-xs text-muted-foreground">{doctor.qualification} • {doctor.experience}y exp</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">₹{doctor.consultationFee}</p>
                    {doctor.availableFrom && (
                      <p className="text-xs text-muted-foreground">{doctor.availableFrom}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">
              Reviews {reviews && reviews.length > 0 ? `(${reviews.length})` : ""}
            </CardTitle>
            {isAuthenticated && !showReviewForm && (
              <Button size="sm" variant="outline" className="flex items-center gap-1.5" onClick={() => setShowReviewForm(true)}>
                <PenLine className="w-3.5 h-3.5" /> Write a Review
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Write review form */}
          {isAuthenticated && showReviewForm && (
            <>
              <WriteReview shopId={id} onSuccess={() => setShowReviewForm(false)} />
              <Separator />
            </>
          )}
          {!isAuthenticated && (
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2.5 mb-2">
              <p className="text-sm text-muted-foreground">Sign in to leave a review</p>
              <Button size="sm" variant="outline" onClick={login}>Sign In</Button>
            </div>
          )}
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{review.userName ?? "Patient"}</span>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No reviews yet. Be the first to rate this shop!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
