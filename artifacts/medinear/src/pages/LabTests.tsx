import { Link } from "wouter";
import { FlaskConical, Plus, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useListLabTests, useDeleteLabTest, getListLabTestsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@workspace/replit-auth-web";

export default function LabTests() {
  const { isAuthenticated, login } = useAuth();
  const { data: tests, isLoading } = useListLabTests();
  const deleteTest = useDeleteLabTest();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCancel = (id: number) => {
    deleteTest.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListLabTestsQueryKey() });
        toast({ title: "Lab test cancelled" });
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FlaskConical className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Sign in to view lab tests</h2>
        <p className="text-muted-foreground text-sm mb-6">View and manage your booked lab tests after signing in.</p>
        <Button onClick={login} data-testid="button-login">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lab Tests</h1>
          <p className="text-muted-foreground text-sm">Book and track your lab tests</p>
        </div>
        <Link href="/lab-tests/new">
          <Button className="flex items-center gap-2" data-testid="button-new-lab-test">
            <Plus className="w-4 h-4" /> Book Test
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (tests ?? []).length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No lab tests booked</h3>
          <p className="text-muted-foreground text-sm mb-4">Book a lab test at a nearby medicine shop</p>
          <Link href="/lab-tests/new">
            <Button data-testid="button-book-first">Book Lab Test</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(tests ?? []).map((test) => (
            <Card key={test.id} data-testid={`card-lab-test-${test.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{test.testName}</h3>
                        <StatusBadge status={test.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{test.category} • {test.shopName}</p>
                      {test.scheduledDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">Scheduled: {test.scheduledDate}</p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-1">₹{test.price}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {test.reportUrl && (
                      <a href={test.reportUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="flex items-center gap-1" data-testid={`button-download-${test.id}`}>
                          <Download className="w-3.5 h-3.5" /> Report
                        </Button>
                      </a>
                    )}
                    {test.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            data-testid={`button-cancel-${test.id}`}
                          >
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                              Cancel Lab Test
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel{" "}
                              <strong>{test.testName}</strong>
                              {test.scheduledDate ? ` scheduled for ${test.scheduledDate}` : ""}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Test</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleCancel(test.id)}
                            >
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
