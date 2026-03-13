import { useState } from "react";
import { useSearchJobs } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/JobCard";
import { Search, Filter, Briefcase } from "lucide-react";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState("");
  const [experience, setExperience] = useState("");
  
  // Debounce search query logic could go here, using direct for simplicity
  const [activeSearch, setActiveSearch] = useState({ query: "", remote: "", experience: "" });

  const { data, isLoading } = useSearchJobs(
    { ...activeSearch, limit: 12 }, 
    { request: getAuthRequestOptions() }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch({ query, remote, experience });
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Explore Opportunities</h1>
        <p className="text-muted-foreground">Find the perfect role that matches your skills.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <form onSubmit={handleSearch} className="glass-card p-5 rounded-2xl">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Job title, keywords..."
                    className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Work Mode</label>
                <select 
                  value={remote}
                  onChange={e => setRemote(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-card"
                >
                  <option value="">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Experience</label>
                <select 
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-card"
                >
                  <option value="">Any Level</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="mid">Mid-Level (3-5 yrs)</option>
                  <option value="senior">Senior (5+ yrs)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : data?.jobs.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground max-w-sm">Try adjusting your search criteria or filters to find what you're looking for.</p>
              <button 
                onClick={() => {
                  setQuery(""); setRemote(""); setExperience("");
                  setActiveSearch({ query: "", remote: "", experience: "" });
                }}
                className="mt-6 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-sm font-medium text-primary transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
