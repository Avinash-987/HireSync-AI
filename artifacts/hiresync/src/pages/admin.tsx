import { useGetAdminStats, useGetAdminUsers } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Users, FileText, Briefcase, BellRing, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ request: getAuthRequestOptions() });
  const { data: users, isLoading: usersLoading } = useGetAdminUsers({ request: getAuthRequestOptions() });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60">Platform analytics and user management.</p>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
            { label: "New Today", value: stats.newUsersToday, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
            { label: "Resumes", value: stats.totalResumes, icon: FileText, color: "text-purple-400", bg: "bg-purple-400/10" },
            { label: "Applications", value: stats.totalApplications, icon: Briefcase, color: "text-amber-400", bg: "bg-amber-400/10" },
            { label: "Active Alerts", value: stats.activeAlerts, icon: BellRing, color: "text-pink-400", bg: "bg-pink-400/10" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm font-medium text-white/60">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Recent Users</h3>
        </div>
        
        {usersLoading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-medium text-white/60 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/60 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-white/60 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-white/50">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-white/70'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-white/40">No users found.</div>
        )}
      </div>
    </AppLayout>
  );
}
