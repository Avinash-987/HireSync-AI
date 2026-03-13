import { useGetAlerts, useCreateAlert, useDeleteAlert } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { BellRing, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");

  const { data: alerts, isLoading } = useGetAlerts({ request: getAuthRequestOptions() });

  const createMutation = useCreateAlert({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        setShowForm(false);
        setKeywords("");
        setLocation("");
      }
    }
  });

  const deleteMutation = useDeleteAlert({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/alerts"] })
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        location,
        frequency,
        isActive: true
      }
    });
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Job Alerts</h1>
          <p className="text-muted-foreground">Get notified when perfect jobs get posted.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Alert
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-6 rounded-2xl mb-8 border border-primary/30">
          <h3 className="font-bold text-foreground mb-4">New Job Alert</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Keywords (comma separated)</label>
              <input 
                type="text" required value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="React, Frontend, Engineer"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
              <input 
                type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="New York, Remote..."
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Frequency</label>
              <select 
                value={frequency} onChange={e => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:ring-1 focus:ring-primary outline-none [&>option]:bg-card"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium">
              Save Alert
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>
      ) : alerts && alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map(alert => (
            <div key={alert.id} className="glass-panel p-6 rounded-2xl flex flex-col relative group">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <BellRing className="h-5 w-5" />
                </div>
                <button 
                  onClick={() => deleteMutation.mutate({ id: alert.id })}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h4 className="font-bold text-lg text-foreground line-clamp-1">{alert.keywords.join(', ')}</h4>
              <p className="text-muted-foreground text-sm mb-4">{alert.location || 'Any Location'}</p>
              
              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <span className="px-2 py-1 bg-secondary rounded text-xs text-secondary-foreground font-medium capitalize">{alert.frequency}</span>
                <span className={`h-2 w-2 rounded-full ${alert.isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground glass-panel rounded-3xl border-dashed">
          <BellRing className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No job alerts configured.</p>
        </div>
      )}
    </AppLayout>
  );
}
