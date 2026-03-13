import { useGetApplications, useUpdateApplication, ApplicationStatus } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar, Building2, MoreHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const COLUMNS = [
  { id: ApplicationStatus.saved, title: "Saved" },
  { id: ApplicationStatus.applied, title: "Applied" },
  { id: ApplicationStatus.assessment, title: "Assessment" },
  { id: ApplicationStatus.interview, title: "Interview" },
  { id: ApplicationStatus.offer, title: "Offer" },
  { id: ApplicationStatus.rejected, title: "Rejected" },
];

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const { data: applications, isLoading } = useGetApplications({
    request: getAuthRequestOptions()
  });

  const updateMutation = useUpdateApplication({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      }
    }
  });

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateMutation.mutate({ id: appId, data: { status: newStatus as any } });
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Application Tracker</h1>
        <p className="text-muted-foreground">Manage your job search pipeline.</p>
      </div>

      <div className="overflow-x-auto pb-6">
        <div className="flex gap-6 min-w-max">
          {COLUMNS.map(column => {
            const columnApps = applications?.filter(app => app.status === column.id) || [];
            
            return (
              <div key={column.id} className="w-[320px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">{column.title}</h3>
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium">{columnApps.length}</span>
                </div>
                
                <div className="glass-panel bg-card/40 p-3 rounded-2xl flex-1 min-h-[400px] flex flex-col gap-3 border border-border">
                  {isLoading ? (
                    <div className="animate-pulse bg-secondary h-24 rounded-xl w-full" />
                  ) : columnApps.length > 0 ? (
                    columnApps.map(app => (
                      <div key={app.id} className="bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-foreground text-sm line-clamp-1 pr-6">{app.job?.title || 'Unknown Job'}</h4>
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <select 
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              value=""
                              className="absolute right-0 w-6 h-6 opacity-0 cursor-pointer"
                            >
                              <option value="" disabled>Move to...</option>
                              {COLUMNS.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                            <button className="p-1 text-muted-foreground hover:text-foreground bg-secondary rounded-md">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 line-clamp-1">
                          <Building2 className="h-3 w-3 shrink-0" /> {app.job?.company || 'Unknown Company'}
                        </div>
                        
                        <div className="pt-3 border-t border-border flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {format(new Date(app.appliedAt), 'MMM d')}
                          </span>
                          
                          {app.interviewDate && column.id === ApplicationStatus.interview && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {format(new Date(app.interviewDate), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm opacity-50">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
