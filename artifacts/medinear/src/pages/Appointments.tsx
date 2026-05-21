import { Link } from "wouter";
import { Calendar, Plus, Stethoscope, MapPin, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useListAppointments, useDeleteAppointment, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@workspace/replit-auth-web";

export default function Appointments() {
  const { isAuthenticated, login } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: appointments, isLoading } = useListAppointments({ status: statusFilter !== "all" ? (statusFilter as any) : undefined });
  const deleteAppointment = useDeleteAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = async (id: number) => {
    deleteAppointment.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment cancelled" });
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sign in to view appointments</h2>
        <p className="text-muted-foreground text-sm mb-6">You need to be signed in to view and manage your appointments.</p>
        <Button onClick={login} data-testid="button-login">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground text-sm">Track and manage your bookings</p>
        </div>
        <Link href="/appointments/new">
          <Button className="flex items-center gap-2" data-testid="button-new-appointment">
            <Plus className="w-4 h-4" /> Book New
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (appointments ?? []).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No appointments yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Book your first appointment with a doctor</p>
          <Link href="/appointments/new">
            <Button data-testid="button-book-first">Book Appointment</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(appointments ?? []).map((apt) => (
            <Card key={apt.id} data-testid={`card-appointment-${apt.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{apt.doctorName ?? "Doctor"}</h3>
                        <StatusBadge status={apt.status} />
                      </div>
                      <p className="text-xs text-primary font-medium">{apt.specialization}</p>
                      {apt.shopName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{apt.shopName}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{apt.appointmentDate} at {apt.appointmentTime}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Hash className="w-3 h-3" />Token: {apt.tokenNumber}
                        </span>
                      </div>
                      {apt.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{apt.notes}"</p>}
                    </div>
                  </div>
                  {apt.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0"
                      onClick={() => handleCancel(apt.id)}
                      data-testid={`button-cancel-${apt.id}`}
                    >
                      Cancel
                    </Button>
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
