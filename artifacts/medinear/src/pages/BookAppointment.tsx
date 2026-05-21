import { useLocation } from "wouter";
import { ArrowLeft, Hash, Calendar, Stethoscope, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateAppointment, useListDoctors, useListShops, useGetDoctor, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/replit-auth-web";

const schema = z.object({
  doctorId: z.string().min(1, "Select a doctor"),
  shopId: z.string().min(1, "Select a shop"),
  appointmentDate: z.string().min(1, "Select a date"),
  appointmentTime: z.string().min(1, "Select a time"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const timeSlots = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM"];

export default function BookAppointment() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login } = useAuth();
  const params = new URLSearchParams(window.location.search);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createAppointment = useCreateAppointment();
  const { data: doctors } = useListDoctors();
  const { data: shops } = useListShops();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      doctorId: params.get("doctorId") ?? "",
      shopId: params.get("shopId") ?? "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    },
  });

  const prefilledDoctorId = params.get("doctorId") ? parseInt(params.get("doctorId")!) : undefined;
  const { data: prefilledDoctor } = useGetDoctor(prefilledDoctorId ?? 0, {
    query: { enabled: !!prefilledDoctorId },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        {prefilledDoctor && (
          <Card className="mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-teal-400" />
            <CardContent className="p-4 flex gap-4 items-center">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                {prefilledDoctor.photoUrl
                  ? <img src={prefilledDoctor.photoUrl} alt={prefilledDoctor.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Stethoscope className="w-6 h-6 text-primary" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{prefilledDoctor.name}</p>
                <Badge className="text-xs bg-primary/10 text-primary border-0 mt-0.5">{prefilledDoctor.specialization}</Badge>
                <p className="text-xs text-muted-foreground mt-0.5">₹{prefilledDoctor.consultationFee} consultation fee</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-1">Sign in to Book</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create an account or sign in to book your appointment and get a token number instantly.
            </p>
            <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
              {["Instant token number assigned", "Real-time status tracking", "Easy cancellation anytime", "Appointment history"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button onClick={login} className="w-full" size="lg">Sign In to Continue</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (data: FormData) => {
    createAppointment.mutate({
      data: {
        doctorId: parseInt(data.doctorId),
        shopId: parseInt(data.shopId),
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        notes: data.notes || undefined,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        toast({ title: "Appointment booked!", description: "Your appointment has been successfully booked." });
        setLocation("/appointments");
      },
      onError: () => {
        toast({ title: "Booking failed", description: "Please try again.", variant: "destructive" });
      },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/appointments">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-2 mb-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Appointments
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-doctor">
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(doctors ?? []).map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name} — {d.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Shop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-shop">
                          <SelectValue placeholder="Select a shop" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(shops ?? []).map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-time">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your symptoms or any special requests..." {...field} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createAppointment.isPending} data-testid="button-submit">
                {createAppointment.isPending ? "Booking..." : "Confirm Appointment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
