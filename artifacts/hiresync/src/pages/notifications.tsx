import { useGetNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Briefcase, Zap, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications({ request: getAuthRequestOptions() });
  
  const readAllMutation = useMarkAllNotificationsRead({
    request: getAuthRequestOptions(),
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }) }
  });

  const readMutation = useMarkNotificationRead({
    request: getAuthRequestOptions(),
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }) }
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'job_match': return <Zap className="h-5 w-5 text-primary" />;
      case 'application_update': return <Briefcase className="h-5 w-5 text-emerald-500" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Notifications</h1>
          <button 
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending || !notifications?.some(n => !n.isRead)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark all read
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => !notif.isRead && readMutation.mutate({ id: notif.id })}
                className={`glass-panel p-5 rounded-2xl flex gap-4 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60' : 'bg-primary/5 hover:bg-primary/10'}`}
              >
                <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${notif.isRead ? 'bg-secondary' : 'bg-background border border-border'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-medium ${notif.isRead ? 'text-foreground' : 'text-foreground font-bold'}`}>{notif.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
