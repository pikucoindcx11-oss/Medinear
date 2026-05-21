import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, MapPin, ChevronRight, Phone, Clock, Star, Stethoscope, FlaskConical, Calendar, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetNearbyShops, useGetPopularDoctors, useGetSpecializations } from "@workspace/api-client-react";
import StarRating from "@/components/StarRating";

const specializationIcons: Record<string, string> = {
  Cardiologist: "❤️", Dermatologist: "🫧", Pediatrician: "👶", Orthopedic: "🦴",
  Neurologist: "🧠", Ophthalmologist: "👁️", Dentist: "🦷", General: "🩺",
  Gynecologist: "🌸", ENT: "👂", Psychiatrist: "🧘", Urologist: "💊",
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { data: shops, isLoading: shopsLoading } = useGetNearbyShops();
  const { data: doctors, isLoading: doctorsLoading } = useGetPopularDoctors();
  const { data: specializations, isLoading: specLoading } = useGetSpecializations();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/shops?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8 space-y-8">
      {/* Hero */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-teal-600 dark:from-primary dark:to-teal-500 p-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 right-16 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Find Healthcare Near You</h1>
          <p className="text-teal-100 text-sm mb-6">Discover nearby medicine shops, book doctor appointments, and manage your health all in one place.</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="input-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops or doctors..."
                className="pl-9 bg-white/95 border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90 font-semibold" data-testid="button-search">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/doctors", label: "Find Doctors", icon: Stethoscope, color: "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400" },
          { href: "/shops", label: "Medicine Shops", icon: Store, color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400" },
          { href: "/appointments/new", label: "Book Appointment", icon: Calendar, color: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400" },
          { href: "/lab-tests/new", label: "Book Lab Test", icon: FlaskConical, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Doctor categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Specializations</h2>
          <Link href="/doctors" className="text-sm text-primary font-medium flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {specLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            : (specializations ?? []).slice(0, 8).map((spec) => (
                <Link key={spec.name} href={`/doctors?specialization=${encodeURIComponent(spec.name)}`}>
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer text-center" data-testid={`card-spec-${spec.name}`}>
                    <span className="text-2xl">{specializationIcons[spec.name] ?? "🏥"}</span>
                    <span className="text-xs font-medium leading-tight">{spec.name}</span>
                    <span className="text-xs text-muted-foreground">{spec.doctorCount}</span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Nearby shops */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Nearby Medicine Shops</h2>
          <Link href="/shops" className="text-sm text-primary font-medium flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopsLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
            : (shops ?? []).map((shop) => (
                <Link key={shop.id} href={`/shops/${shop.id}`}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer overflow-hidden" data-testid={`card-shop-${shop.id}`}>
                    {shop.imageUrl && (
                      <div className="h-32 bg-muted overflow-hidden">
                        <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{shop.name}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />{shop.address}
                          </p>
                          <StarRating rating={shop.rating} count={shop.reviewCount} />
                        </div>
                        <Badge variant={shop.isOpen ? "default" : "secondary"} className={shop.isOpen ? "bg-emerald-500 text-white text-xs" : "text-xs"}>
                          {shop.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      {shop.openingTime && shop.closingTime && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                          <Clock className="w-3 h-3" />{shop.openingTime} - {shop.closingTime}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* Popular doctors */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Popular Doctors</h2>
          <Link href="/doctors" className="text-sm text-primary font-medium flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctorsLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
            : (doctors ?? []).map((doctor) => (
                <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
                  <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" data-testid={`card-doctor-${doctor.id}`}>
                    <CardContent className="p-4 flex gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                        {doctor.photoUrl
                          ? <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Stethoscope className="w-6 h-6 text-primary" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{doctor.name}</h3>
                        <p className="text-xs text-primary font-medium">{doctor.specialization}</p>
                        <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
                        <StarRating rating={doctor.rating} count={doctor.reviewCount} />
                        <p className="text-xs font-semibold text-foreground mt-1">₹{doctor.consultationFee} <span className="text-muted-foreground font-normal">consultation</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* Emergency */}
      <div className="rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-red-700 dark:text-red-400">Emergency?</h3>
          <p className="text-sm text-red-600 dark:text-red-500">Call emergency services immediately</p>
        </div>
        <a href="tel:102">
          <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2" data-testid="button-emergency">
            <Phone className="w-4 h-4" /> Call 102
          </Button>
        </a>
      </div>
    </div>
  );
}
