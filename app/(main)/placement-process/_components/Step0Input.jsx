"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { startPlacementProcess } from '@/actions/placement';
import { parseFileText } from '@/actions/file-parser';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function Step0Input({ onProcessCreated }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const [salary, setSalary] = useState("10 LPA");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [uploadingJD, setUploadingJD] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleFileUpload = async (e, setter, setUploadingState) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingState(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const text = await parseFileText(formData);
      setter(text);
      toast.success("File text extracted successfully", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Failed to parse file", { id: toastId });
    } finally {
      setUploadingState(false);
      e.target.value = null; // reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const p = await startPlacementProcess({ role, jobDescription, salary, resumeText });
      onProcessCreated(p);
      toast.success("Profile submitted for shortlisting.");
    } catch (error) {
      toast.error(error.message || "Failed to start process.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl border-primary/20 shadow-xl bg-card">
      <CardHeader className="text-center pb-6 border-b bg-muted/10">
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">Initial Application</CardTitle>
        <CardDescription className="text-base">Provide target role details and your resume to begin.</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80 text-sm">Target Role</Label>
              <Input required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer" className="font-medium bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80 text-sm">Target Salary / Difficulty Basis</Label>
              <Input required value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. 15 LPA" className="font-medium bg-background" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-foreground/80 text-sm">Job Description</Label>
              <Label className={`cursor-pointer text-xs flex items-center gap-1 transition-colors ${uploadingJD ? 'text-muted-foreground' : 'text-primary hover:text-primary/80'}`}>
                {uploadingJD ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingJD ? "Extracting..." : "Upload PDF/TXT"}
                <input type="file" className="hidden" accept=".txt,.pdf" disabled={uploadingJD} onChange={(e) => handleFileUpload(e, setJobDescription, setUploadingJD)} />
              </Label>
            </div>
            <Textarea 
              required 
              value={jobDescription} 
              onChange={e => setJobDescription(e.target.value)} 
              placeholder="Paste the target job description here or upload a file..." 
              className="min-h-[120px] font-mono text-xs bg-background leading-relaxed" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="font-semibold text-foreground/80 text-sm">Applicant Resume (Text Output)</Label>
              <Label className={`cursor-pointer text-xs flex items-center gap-1 transition-colors ${uploadingResume ? 'text-muted-foreground' : 'text-primary hover:text-primary/80'}`}>
                {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingResume ? "Extracting..." : "Upload PDF/TXT"}
                <input type="file" className="hidden" accept=".txt,.pdf" disabled={uploadingResume} onChange={(e) => handleFileUpload(e, setResumeText, setUploadingResume)} />
              </Label>
            </div>
            <Textarea 
              required 
              value={resumeText} 
              onChange={e => setResumeText(e.target.value)} 
              placeholder="Paste the text format of your resume or upload a file..." 
              className="min-h-[150px] font-mono text-xs bg-background leading-relaxed" 
            />
            <p className="text-xs text-muted-foreground mt-2 italic">We use raw text for AI-based ATS shortlisting. You can edit the extracted text before submitting.</p>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-lg shadow-lg">
            {loading ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : "Apply & Start Process"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
