import React from "react";
import { Link } from "wouter";
import { MapPin, DollarSign, Building2, Bookmark, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Job, RecommendedJob } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";
import { useSaveJob, useDeleteSavedJob } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface JobCardProps {
  job: any;
  isRecommended?: boolean;
}

export function JobCard({ job, isRecommended = false }: JobCardProps) {
  const queryClient = useQueryClient();
  const recJob = job as any;
  
  const saveMutation = useSaveJob({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/search"] });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/recommended"] });
      }
    }
  });

  const removeMutation = useDeleteSavedJob({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/saved-jobs"] });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/search"] });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/recommended"] });
      }
    }
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (job.isSaved) {
      removeMutation.mutate({ id: job.id });
    } else {
      saveMutation.mutate({ data: { jobId: job.id } });
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative flex flex-col group h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-bold border border-white/10 shrink-0">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
            ) : (
              job.company?.charAt(0).toUpperCase() || 'C'
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSave}
          aria-label={job.isSaved ? "Remove from saved jobs" : "Save job"}
          className={`p-2 rounded-full transition-colors shrink-0 z-10 relative ${job.isSaved ? 'text-primary bg-primary/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
        >
          <Bookmark className={`w-5 h-5 pointer-events-none ${job.isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/80">
          <MapPin className="w-3 h-3" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/80 capitalize">
          <DollarSign className="w-3 h-3" /> {job.employmentType}
        </span>
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 text-white/80 capitalize">
          {job.remoteType}
        </span>
        {(job.salaryMin || job.salaryMax) && (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-green-500/10 text-green-400">
            {job.salaryMin && job.salaryMax 
              ? `${formatCurrency(job.salaryMin)} – ${formatCurrency(job.salaryMax)}`
              : job.salaryMin 
              ? `From ${formatCurrency(job.salaryMin)}`
              : `Up to ${formatCurrency(job.salaryMax)}`
            }
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {job.skills?.slice(0, 4).map((skill: string) => (
          <span key={skill} className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-black/20 text-white/70">
            {skill}
          </span>
        ))}
        {job.skills?.length > 4 && (
          <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-black/20 text-white/70">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      {isRecommended && recJob.matchScore && (
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white/80">AI Match Score</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getMatchColor(recJob.matchScore)}`}>
              {recJob.matchScore}%
            </span>
          </div>
          <div className="space-y-1.5 mt-3">
            {recJob.matchReasons?.slice(0, 2).map((reason: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-xs text-white/40 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {job.postedAt ? formatDistanceToNow(new Date(job.postedAt), { addSuffix: true }) : 'Recently'}
        </span>
        <a 
          href={job.sourceUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium px-4 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
