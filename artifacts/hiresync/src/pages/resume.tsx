import { useState, useCallback } from "react";
import { useGetResumes, useUploadResume } from "@workspace/api-client-react";
import { getAuthRequestOptions } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ResumePage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");

  const { data: resumes, isLoading } = useGetResumes({
    request: getAuthRequestOptions()
  });

  const uploadMutation = useUploadResume({
    request: getAuthRequestOptions(),
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/jobs/recommended"] });
      },
      onError: (err: any) => {
        setError(err.message || "Failed to upload resume");
      }
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError("");
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be smaller than 5MB");
        return;
      }
      uploadMutation.mutate({ data: { file } });
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const activeResume = resumes?.[0]; // Assuming latest is active

  return (
    <AppLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Resume ATS Scanner</h1>
          <p className="text-muted-foreground">Upload your resume to get scored and extract skills for AI matching.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-panel p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-background/50'
            }`}
          >
            <input {...getInputProps()} />
            {uploadMutation.isPending ? (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-foreground font-medium">Analyzing resume...</p>
                <p className="text-sm text-muted-foreground mt-2">Extracting skills and generating ATS score</p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Upload Resume</h3>
                <p className="text-sm text-muted-foreground px-4">Drag and drop your PDF or DOCX file here, or click to browse</p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
              {error}
            </div>
          )}

          {activeResume && (
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground truncate">{activeResume.fileName}</p>
                  <p className="text-xs text-muted-foreground">Uploaded {new Date(activeResume.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="glass-card p-12 rounded-3xl flex items-center justify-center h-full min-h-[400px]">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : activeResume ? (
            <div className="glass-card p-8 rounded-3xl h-full space-y-8">
              <div className="flex items-center gap-8 border-b border-border pb-8">
                <div className="relative h-32 w-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-secondary" strokeWidth="12" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      className={`stroke-current animate-dash ${activeResume.atsScore >= 80 ? 'text-emerald-500' : activeResume.atsScore >= 60 ? 'text-yellow-500' : 'text-destructive'}`}
                      strokeWidth="12" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="351.85"
                      strokeDashoffset={351.85 - (351.85 * activeResume.atsScore) / 100}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-foreground">{activeResume.atsScore}</span>
                    <span className="text-xs font-medium text-muted-foreground">ATS Score</span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Resume Analysis</h2>
                  <p className="text-muted-foreground">
                    {activeResume.atsScore >= 80 ? "Great job! Your resume is highly optimized." : 
                     activeResume.atsScore >= 60 ? "Good start, but some improvements needed to beat the ATS." : 
                     "Your resume needs significant optimization for better matching."}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Extracted Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-secondary border border-border rounded-lg text-sm text-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {activeResume.missingSkills && activeResume.missingSkills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" /> Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeResume.missingSkills.map(s => (
                        <span key={s} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-600 dark:text-yellow-500">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeResume.suggestions && activeResume.suggestions.length > 0 && (
                <div className="bg-secondary/50 rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">Improvement Suggestions</h3>
                  <ul className="space-y-3">
                    {activeResume.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="h-5 w-5 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] mt-0.5">
                          {i+1}
                        </div>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-foreground">No resume analyzed yet</p>
              <p className="text-muted-foreground text-sm">Upload a document to see insights</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
