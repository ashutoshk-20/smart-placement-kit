"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, FileText, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { generateCoverLetter } from '@/actions/cover-letter';

const coverLetterSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  jobDescription: z.string().optional(),
});

export default function CoverLetterGenerator({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      companyName: '',
      jobTitle: '',
      jobDescription: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await generateCoverLetter(data);
      toast.success("Cover letter generated successfully!");
      if (onSuccess) onSuccess();
      router.refresh();
      router.push(`/ai-cover-letter/${result._id}`);
    } catch (error) {
      toast.error(error.message || "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Generate Cover Letter
            </CardTitle>
            <CardDescription>
                Provide details about the job you're applying for, and we'll craft a personalized cover letter based on your profile.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input 
                            id="companyName" 
                            placeholder="e.g. Google, Stripe" 
                            {...register('companyName')} 
                        />
                        {errors.companyName && (
                            <p className="text-sm text-red-500">{errors.companyName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title *</Label>
                        <Input 
                            id="jobTitle" 
                            placeholder="e.g. Frontend Engineer" 
                            {...register('jobTitle')} 
                        />
                        {errors.jobTitle && (
                            <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description (Optional but Recommended)</Label>
                    <Textarea 
                        id="jobDescription" 
                        placeholder="Paste the job description here to help tailor the cover letter to the role's specific requirements..." 
                        rows={6}
                        {...register('jobDescription')} 
                    />
                </div>

                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 text-lg shadow-lg group"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Crafting your letter...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5 mr-2" />
                            Generate Cover Letter
                        </>
                    )}
                </Button>
            </form>
        </CardContent>
    </Card>
  );
}
