import { useLocation } from "wouter";
import { ArrowLeft, FlaskConical, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateLabTest, useListShops, getListLabTestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@workspace/replit-auth-web";

const labCategories = ["Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", "ECG", "Ultrasound", "Thyroid Test", "Diabetes Test", "Lipid Profile", "Liver Function", "Kidney Function"];

const schema = z.object({
  testName: z.string().min(1, "Enter test name"),
  category: z.string().min(1, "Select a category"),
  shopId: z.string().min(1, "Select a shop"),
  scheduledDate: z.string().min(1, "Select a date"),
  price: z.string().min(1, "Enter price"),
});

type FormData = z.infer<typeof schema>;

export default function BookLabTest() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createLabTest = useCreateLabTest();
  const { data: shops } = useListShops();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { testName: "", category: "", shopId: "", scheduledDate: "", price: "" },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <FlaskConical className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-1">Sign in to Book a Lab Test</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in to schedule lab tests at nearby medicine shops and track your results.
            </p>
            <ul className="text-left space-y-2 mb-6 text-sm text-muted-foreground">
              {["Book from 12+ test categories", "Schedule at your preferred shop", "Track test status in real time", "Download reports when ready"].map((item) => (
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
    createLabTest.mutate({
      data: {
        testName: data.testName,
        category: data.category,
        shopId: parseInt(data.shopId),
        scheduledDate: data.scheduledDate,
        price: parseFloat(data.price),
      },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() });
        toast({ title: "Lab test booked!", description: "Your lab test has been scheduled." });
        setLocation("/lab-tests");
      },
      onError: () => {
        toast({ title: "Booking failed", description: "Please try again.", variant: "destructive" });
      },
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/lab-tests">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 -ml-2 mb-4" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Lab Tests
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Book a Lab Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Complete Blood Count" {...field} data-testid="input-test-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        {(shops ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} data-testid="input-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={createLabTest.isPending} data-testid="button-submit">
                {createLabTest.isPending ? "Booking..." : "Book Lab Test"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
