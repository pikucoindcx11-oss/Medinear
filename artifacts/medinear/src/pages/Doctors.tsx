import { useState } from "react";
import { Link } from "wouter";
import { Search, Stethoscope, Star, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListDoctors, useGetSpecializations } from "@workspace/api-client-react";
import StarRating from "@/components/StarRating";

export default function Doctors() {
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get("search") ?? "");
  const [spec, setSpec] = useState(new URLSearchParams(window.location.search).get("specialization") ?? "");
  const { data: doctors, isLoading } = useListDoctors({ search: search || undefined, specialization: spec || undefined });
  const { data: specializations } = useGetSpecializations();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Find Doctors</h1>
        <p className="text-muted-foreground text-sm">Browse qualified doctors available near you</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-doctor-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="pl-9"
          />
        </div>
        <Select value={spec || "all"} onValueChange={(v) => setSpec(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48" data-testid="select-specialization">
            <SelectValue placeholder="All specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specializations</SelectItem>
            {(specializations ?? []).map((s) => (
              <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (doctors ?? []).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No doctors found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(doctors ?? []).map((doctor) => (
            <Link key={doctor.id} href={`/doctors/${doctor.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer" data-testid={`card-doctor-${doctor.id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                      {doctor.photoUrl
                        ? <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Stethoscope className="w-7 h-7 text-primary" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{doctor.name}</h3>
                      <Badge variant="secondary" className="text-xs text-primary bg-primary/10 border-0 mt-0.5">{doctor.specialization}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{doctor.qualification} • {doctor.experience}y exp</p>
                      <StarRating rating={doctor.rating} count={doctor.reviewCount} />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      {doctor.shopName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{doctor.shopName}
                        </p>
                      )}
                      {doctor.availableFrom && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{doctor.availableFrom} – {doctor.availableTo}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary">₹{doctor.consultationFee}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
