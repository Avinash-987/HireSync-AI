import { useState, useEffect } from "react";
import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { User, Loader2, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({ request: getAuthRequestOptions() });
  
  const [formData, setFormData] = useState({
    headline: "",
    bio: "",
    experienceLevel: "junior",
    location: "",
    github: "",
    linkedin: "",
    skills: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        headline: profile.headline || "",
        bio: profile.bio || "",
        experienceLevel: profile.experienceLevel || "junior",
        location: profile.location || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        skills: profile.skills?.join(", ") || ""
      });
    }
  }, [profile]);

  const updateMutation = useUpdateProfile({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
        toast.success("Profile updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update profile");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      data: {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceLevel: formData.experienceLevel as any
      }
    });
  };

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">Your Profile</h1>
            <p className="text-muted-foreground">Complete your profile for better AI matching.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Professional Headline</label>
              <input type="text" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Senior React Developer" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">About (Bio)</label>
              <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="Briefly describe your background..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Experience Level</label>
              <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary [&>option]:bg-card">
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="City, Country or Remote" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Skills (comma separated)</label>
              <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="React, Node.js, TypeScript..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">LinkedIn URL</label>
              <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="https://linkedin.com/in/..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">GitHub URL</label>
              <input type="url" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground outline-none focus:ring-1 focus:ring-primary" placeholder="https://github.com/..." />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg disabled:opacity-50">
              {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Save Profile
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
