import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Stethoscope, MapPin, Clock, DollarSign, Award, Star, Calendar, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGetDoctor, useListReviews, getGetDoctorQueryKey } from "@workspace/api-client-react";
import StarRating from "@/components/StarRating";
import WriteReview from "@/components/WriteReview";
import { useAuth } from "@workspace/replit-auth-web";

export default function DoctorDetail({ id }: { id: number }) {
  const { data: doctor, isLoading } = useGetDoctor(id, { query: { queryKey: getGetDoctorQueryKey(id) } });
  const { data: reviews } = useListReviews({ doctorId: id });
  const { isAuthenticated, login } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  if (!doctor) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">Doctor not found</p>
      <Link href="/doctors"><Button variant="outline" className="mt-4">Back to Doctors</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Link href="/doctors">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-2" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </Button>
      </Link>

      {/* Doctor profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-5 items-start">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex-shrink-0">
              {doctor.photoUrl
                ? <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Stethoscope className="w-10 h-10 text-primary" /></div>
              }
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{doctor.name}</h1>
              <Badge className="text-sm bg-primary/10 text-primary border-0 mt-1">{doctor.specialization}</Badge>
              <p className="text-muted-foreground text-sm mt-1">{doctor.qualification}</p>
              <StarRating rating={doctor.rating} count={doctor.reviewCount} size="md" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-primary/5 rounded-xl p-3 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-bold text-lg">{doctor.experience}</p>
              <p className="text-xs text-muted-foreground">Years Exp.</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-center">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="font-bold text-lg">₹{doctor.consultationFee}</p>
              <p className="text-xs text-muted-foreground">Consult. Fee</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 text-center">
              <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="font-bold text-lg">{doctor.rating?.toFixed(1) ?? "N/A"}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="font-bold text-sm">{doctor.availableDays ?? "Daily"}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>

          {(doctor.availableFrom || doctor.shopName) && (
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {doctor.availableFrom && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Available: {doctor.availableFrom} – {doctor.availableTo}</span>
                </div>
              )}
              {doctor.shopName && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Link href={`/shops/${doctor.shopId}`} className="hover:text-primary">
                    {doctor.shopName}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            {isAuthenticated ? (
              <Link href={`/appointments/new?doctorId=${doctor.id}&shopId=${doctor.shopId}`}>
                <Button className="w-full sm:w-auto" data-testid="button-book-appointment">
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
              </Link>
            ) : (
              <Button onClick={login} className="w-full sm:w-auto" data-testid="button-login-to-book">
                Sign in to Book Appointment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Patient Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{review.userName ?? "Patient"}</span>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reviews && reviews.length === 0 && !showReviewForm && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            No reviews yet. Be the first to review this doctor.
          </CardContent>
        </Card>
      )}

      {/* Write a review */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <PenLine className="w-4 h-4" /> Write a Review
            </CardTitle>
            {!showReviewForm && isAuthenticated && (
              <Button size="sm" variant="outline" onClick={() => setShowReviewForm(true)}>
                Add Review
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
              <Button size="sm" variant="outline" onClick={login}>Sign In</Button>
            </div>
          ) : showReviewForm ? (
            <WriteReview
              doctorId={id}
              onSuccess={() => setShowReviewForm(false)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Click "Add Review" to share your experience.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
