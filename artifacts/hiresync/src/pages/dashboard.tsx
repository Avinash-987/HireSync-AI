import { useGetDashboardStats, useGetRecommendedJobs } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { JobCard } from "@/components/JobCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Briefcase, Bookmark, FileText, Bell, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "wouter";

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    request: getAuthRequestOptions()
  });

  const { data: recommended, isLoading: recLoading } = useGetRecommendedJobs({
    request: getAuthRequestOptions()
  });

  if (statsLoading || recLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  const pieData = stats ? [
    { name: 'Applied', value: stats.applicationsByStatus.applied },
    { name: 'Assessment', value: stats.applicationsByStatus.assessment },
    { name: 'Interview', value: stats.applicationsByStatus.interview },
    { name: 'Offer', value: stats.applicationsByStatus.offer },
    { name: 'Rejected', value: stats.applicationsByStatus.rejected },
  ].filter(d => d.value > 0) : [];

  const barData = stats?.skillsInDemand?.map((s, i) => ({
    name: s,
    value: 100 - (i * 10) // Mocking demand value for display
  })) || [];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">Overview</h1>
        <p className="text-muted-foreground">Here's what's happening with your job search.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applications", value: stats?.totalApplications || 0, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Saved Jobs", value: stats?.savedJobs || 0, icon: Bookmark, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "ATS Score", value: stats?.atsScore || 0, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10", suffix: "%" },
          { label: "Active Alerts", value: stats?.activeAlerts || 0, icon: Bell, color: "text-pink-500", bg: "bg-pink-500/10" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground">{stat.value}{stat.suffix}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Application Status Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-6">Application Status</h3>
          <div className="flex-1 min-h-[250px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Briefcase className="h-8 w-8 mb-2 opacity-50" />
                <p>No applications yet</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Skills in Demand */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Skills in Your Market</h3>
          <div className="h-[250px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Upload resume to see market insights</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Top Picks For You</h3>
          </div>
          <Link href="/jobs/recommended" className="text-sm text-primary hover:underline font-medium">View all</Link>
        </div>
        
        {recommended && recommended.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.slice(0, 3).map(job => (
              <JobCard key={job.id} job={job} isRecommended={true} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-10 rounded-2xl text-center border-dashed">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">We need your resume to recommend jobs.</p>
            <Link href="/resume" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              <FileText className="h-4 w-4" /> Upload Resume
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
