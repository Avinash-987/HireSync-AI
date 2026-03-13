import { useGetRecommendedJobs } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/JobCard";
import { Sparkles, FileText } from "lucide-react";
import { Link } from "wouter";

export default function RecommendedJobsPage() {
  const { data: jobs, isLoading } = useGetRecommendedJobs({ 
    request: getAuthRequestOptions() 
  });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" /> AI Matches
        </h1>
        <p className="text-muted-foreground">Jobs tailored to your unique skills and experience profile.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} isRecommended={true} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-foreground mb-2">We need your resume</h3>
          <p className="text-muted-foreground max-w-sm mb-6">Upload your resume so our AI can analyze your skills and match you with perfect roles.</p>
          <Link href="/resume" className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-all shadow-lg shadow-primary/25">
            Go to ATS Scanner
          </Link>
        </div>
      )}
    </AppLayout>
  );
}
