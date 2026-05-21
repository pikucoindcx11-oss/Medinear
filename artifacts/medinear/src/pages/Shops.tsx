import { useState } from "react";
import { Link } from "wouter";
import { Search, MapPin, Clock, Phone, ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useListShops } from "@workspace/api-client-react";
import StarRating from "@/components/StarRating";

export default function Shops() {
  const [search, setSearch] = useState(new URLSearchParams(window.location.search).get("search") ?? "");
  const [filterOpen, setFilterOpen] = useState<boolean | undefined>(undefined);
  const { data: shops, isLoading } = useListShops({ search: search || undefined, isOpen: filterOpen });

  const filtered = (shops ?? []).filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Medicine Shops</h1>
        <p className="text-muted-foreground text-sm">Find medicine shops near you</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-shop-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterOpen === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOpen(undefined)}
            data-testid="filter-all"
          >All</Button>
          <Button
            variant={filterOpen === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOpen(true)}
            data-testid="filter-open"
          >Open Now</Button>
          <Button
            variant={filterOpen === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOpen(false)}
            data-testid="filter-closed"
          >Closed</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No shops found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5" data-testid={`card-shop-${shop.id}`}>
              {shop.imageUrl && (
                <div className="h-40 bg-muted overflow-hidden">
                  <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{shop.name}</h3>
                    <StarRating rating={shop.rating} count={shop.reviewCount} />
                  </div>
                  <Badge variant={shop.isOpen ? "default" : "secondary"} className={shop.isOpen ? "bg-emerald-500 text-white text-xs flex-shrink-0" : "text-xs flex-shrink-0"}>
                    {shop.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-xs">{shop.address}</span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">{shop.phone}</span>
                    </div>
                  )}
                  {shop.openingTime && shop.closingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs">{shop.openingTime} - {shop.closingTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Link href={`/shops/${shop.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full flex items-center gap-1" data-testid={`button-view-shop-${shop.id}`}>
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  {shop.lat && shop.lng && (
                    <a href={`https://maps.google.com/?q=${shop.lat},${shop.lng}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" data-testid={`button-map-${shop.id}`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
