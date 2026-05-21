import { useState } from "react";
import { LayoutDashboard, Store, Stethoscope, Calendar, FlaskConical, Plus, Edit, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useGetDashboardStats, useListShops, useCreateShop, useDeleteShop, useListDoctors, useCreateDoctor, useDeleteDoctor,
  useListAppointments, useUpdateAppointment, useListLabTests, useUpdateLabTest,
  getListShopsQueryKey, getListDoctorsQueryKey, getListAppointmentsQueryKey, getListLabTestsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@workspace/replit-auth-web";
import StatusBadge from "@/components/StatusBadge";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: shops } = useListShops();
  const { data: doctors } = useListDoctors();
  const { data: appointments } = useListAppointments();
  const { data: labTests } = useListLabTests();
  const createShop = useCreateShop();
  const deleteShop = useDeleteShop();
  const createDoctor = useCreateDoctor();
  const deleteDoctor = useDeleteDoctor();
  const updateAppointment = useUpdateAppointment();
  const updateLabTest = useUpdateLabTest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newShop, setNewShop] = useState({ name: "", address: "", phone: "", isOpen: true, openingTime: "09:00 AM", closingTime: "08:00 PM" });
  const [newDoctor, setNewDoctor] = useState({ name: "", qualification: "", specialization: "", experience: "0", consultationFee: "0", shopId: "", availableFrom: "09:00 AM", availableTo: "05:00 PM", availableDays: "Mon-Sat" });

  if (!isAuthenticated || !(user as any)?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground text-sm">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const handleCreateShop = () => {
    createShop.mutate({ data: newShop }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListShopsQueryKey() });
        toast({ title: "Shop created" });
        setNewShop({ name: "", address: "", phone: "", isOpen: true, openingTime: "09:00 AM", closingTime: "08:00 PM" });
      },
    });
  };

  const handleDeleteShop = (id: number) => {
    deleteShop.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListShopsQueryKey() }) });
  };

  const handleCreateDoctor = () => {
    createDoctor.mutate({
      data: {
        name: newDoctor.name,
        qualification: newDoctor.qualification,
        specialization: newDoctor.specialization,
        experience: parseInt(newDoctor.experience),
        consultationFee: parseFloat(newDoctor.consultationFee),
        shopId: parseInt(newDoctor.shopId),
        availableFrom: newDoctor.availableFrom,
        availableTo: newDoctor.availableTo,
        availableDays: newDoctor.availableDays,
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDoctorsQueryKey() });
        toast({ title: "Doctor added" });
        setNewDoctor({ name: "", qualification: "", specialization: "", experience: "0", consultationFee: "0", shopId: "", availableFrom: "09:00 AM", availableTo: "05:00 PM", availableDays: "Mon-Sat" });
      },
    });
  };

  const handleDeleteDoctor = (id: number) => {
    deleteDoctor.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDoctorsQueryKey() }) });
  };

  const handleUpdateAppointmentStatus = (id: number, status: string) => {
    updateAppointment.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() }),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground text-sm">Manage your MediNear platform</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4" />Dashboard</TabsTrigger>
          <TabsTrigger value="shops" className="flex items-center gap-1.5"><Store className="w-4 h-4" />Shops</TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-1.5"><Stethoscope className="w-4 h-4" />Doctors</TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Appointments</TabsTrigger>
          <TabsTrigger value="lab-tests" className="flex items-center gap-1.5"><FlaskConical className="w-4 h-4" />Lab Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Shops" value={stats.totalShops} icon={Store} color="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" />
              <StatCard label="Open Shops" value={stats.openShops} icon={Store} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" />
              <StatCard label="Doctors" value={stats.totalDoctors} icon={Stethoscope} color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" />
              <StatCard label="Total Appointments" value={stats.totalAppointments} icon={Calendar} color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" />
              <StatCard label="Pending Apts." value={stats.pendingAppointments} icon={Calendar} color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" />
              <StatCard label="Completed Apts." value={stats.completedAppointments} icon={Calendar} color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" />
              <StatCard label="Lab Tests" value={stats.totalLabTests} icon={FlaskConical} color="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400" />
              <StatCard label="Users" value={stats.totalUsers} icon={LayoutDashboard} color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="shops">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Medicine Shops ({shops?.length ?? 0})</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1.5" data-testid="button-add-shop">
                  <Plus className="w-4 h-4" /> Add Shop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Medicine Shop</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newShop.name} onChange={(e) => setNewShop({ ...newShop, name: e.target.value })} data-testid="input-shop-name" /></div>
                  <div><Label>Address</Label><Input value={newShop.address} onChange={(e) => setNewShop({ ...newShop, address: e.target.value })} /></div>
                  <div><Label>Phone</Label><Input value={newShop.phone} onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })} /></div>
                  <div><Label>Opening Time</Label><Input value={newShop.openingTime} onChange={(e) => setNewShop({ ...newShop, openingTime: e.target.value })} /></div>
                  <div><Label>Closing Time</Label><Input value={newShop.closingTime} onChange={(e) => setNewShop({ ...newShop, closingTime: e.target.value })} /></div>
                  <div className="flex items-center gap-2"><Switch checked={newShop.isOpen} onCheckedChange={(v) => setNewShop({ ...newShop, isOpen: v })} /><Label>Open Now</Label></div>
                  <Button className="w-full" onClick={handleCreateShop} disabled={createShop.isPending} data-testid="button-create-shop">Create Shop</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {(shops ?? []).map((shop) => (
              <Card key={shop.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{shop.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{shop.address}</p>
                  </div>
                  <Badge variant={shop.isOpen ? "default" : "secondary"} className={shop.isOpen ? "bg-emerald-500 text-white text-xs" : "text-xs"}>
                    {shop.isOpen ? "Open" : "Closed"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteShop(shop.id)} data-testid={`button-delete-shop-${shop.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="doctors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Doctors ({doctors?.length ?? 0})</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1.5" data-testid="button-add-doctor">
                  <Plus className="w-4 h-4" /> Add Doctor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Add Doctor</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} /></div>
                  <div><Label>Qualification</Label><Input value={newDoctor.qualification} onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })} placeholder="MBBS, MD..." /></div>
                  <div><Label>Specialization</Label><Input value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} /></div>
                  <div><Label>Experience (years)</Label><Input type="number" value={newDoctor.experience} onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })} /></div>
                  <div><Label>Consultation Fee (₹)</Label><Input type="number" value={newDoctor.consultationFee} onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })} /></div>
                  <div>
                    <Label>Shop</Label>
                    <Select value={newDoctor.shopId} onValueChange={(v) => setNewDoctor({ ...newDoctor, shopId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                      <SelectContent>{(shops ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Available From</Label><Input value={newDoctor.availableFrom} onChange={(e) => setNewDoctor({ ...newDoctor, availableFrom: e.target.value })} /></div>
                  <div><Label>Available To</Label><Input value={newDoctor.availableTo} onChange={(e) => setNewDoctor({ ...newDoctor, availableTo: e.target.value })} /></div>
                  <div><Label>Available Days</Label><Input value={newDoctor.availableDays} onChange={(e) => setNewDoctor({ ...newDoctor, availableDays: e.target.value })} placeholder="Mon-Sat" /></div>
                  <Button className="w-full" onClick={handleCreateDoctor} disabled={createDoctor.isPending}>Add Doctor</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {(doctors ?? []).map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.specialization} • {doc.shopName}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">₹{doc.consultationFee}</p>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDoctor(doc.id)} data-testid={`button-delete-doctor-${doc.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <h2 className="text-lg font-semibold mb-4">All Appointments ({appointments?.length ?? 0})</h2>
          <div className="space-y-2">
            {(appointments ?? []).map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{apt.doctorName} — Token #{apt.tokenNumber}</p>
                    <p className="text-xs text-muted-foreground">{apt.appointmentDate} at {apt.appointmentTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <Select value={apt.status} onValueChange={(v) => handleUpdateAppointmentStatus(apt.id, v)}>
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="lab-tests">
          <h2 className="text-lg font-semibold mb-4">All Lab Tests ({labTests?.length ?? 0})</h2>
          <div className="space-y-2">
            {(labTests ?? []).map((test) => (
              <Card key={test.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{test.testName}</p>
                    <p className="text-xs text-muted-foreground">{test.category} • {test.shopName} • ₹{test.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={test.status} />
                    <Select value={test.status} onValueChange={(v) => updateLabTest.mutate({ id: test.id, data: { status: v as any } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() }) })}>
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
