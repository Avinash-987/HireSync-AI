import { useGetSavedJobs } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/JobCard";
import { Bookmark } from "lucide-react";
import { Link } from "wouter";

export default function SavedJobsPage() {
  const { data: savedJobs, isLoading } = useGetSavedJobs({
    request: getAuthRequestOptions()
  });

  return (
    <AppLayout>
      <div className="mb-8 flex items-center gap-3">
        <Bookmark className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you've bookmarked to apply later.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : savedJobs && savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) => (
            <div key={item.id} className="relative h-full">
              {item.job && <JobCard job={{ ...item.job, isSaved: true }} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center border-dashed">
          <Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground mb-2">No saved jobs</h3>
          <p className="text-muted-foreground max-w-sm mb-6">You haven't bookmarked any jobs yet. Start exploring!</p>
          <Link href="/jobs" className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-colors">
            Browse Jobs
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
