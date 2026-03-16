"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { evaluateResumeShortlist } from '@/actions/placement';
import { Loader2, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Step1Shortlist({ process, setProcess }) {
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Attempt auto-eval ONLY if we haven't done it yet
    if (process.resumeShortlistResult) {
      setResult(process.resumeShortlistResult);
    }
  }, [process]);

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const updatedProcess = await evaluateResumeShortlist(process._id);
      setResult(updatedProcess.resumeShortlistResult);
      if (!updatedProcess.resumeShortlistResult.passed) {
          toast.error("Resume did not pass ATS.");
      } else {
          toast.success("Resume shortlisted!");
      }
      // Delay state update slightly so user can read result
      setTimeout(() => {
        setProcess(updatedProcess);
      }, 3000);
    } catch (error) {
       toast.error(error.message || "Failed to parse resume.");
    } finally {
       setEvaluating(false);
    }
  };

  return (
    <Card className="w-full bg-card shadow-lg border-primary/20">
      <CardHeader className="border-b bg-muted/10 pb-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-primary/20 rounded-xl">
             <FileText className="w-8 h-8 text-primary" />
           </div>
           <div>
              <CardTitle className="text-2xl text-primary font-bold">Round 1: Resume Shortlisting</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm font-medium">AI analysis mapping your resume against the Job Description.</p>
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
         {!result && !evaluating && (
             <div className="flex flex-col items-center py-6 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 text-yellow-500 opacity-80" />
                <h3 className="text-xl font-semibold">Ready for ATS Check</h3>
                <p className="text-muted-foreground max-w-sm">We are about to evaluate your resume specifically for the <span className="font-bold text-foreground">{process.role}</span> position.</p>
                <Button onClick={runEvaluation} size="lg" className="h-12 w-full max-w-sm mt-4 text-white hover:bg-primary/90 text-md shadow-md">
                   Start Shortlist Process
                </Button>
             </div>
         )}

         {evaluating && (
            <div className="flex flex-col items-center py-10 space-y-4">
               <Loader2 className="w-12 h-12 text-primary animate-spin" />
               <h3 className="text-lg font-semibold animate-pulse text-muted-foreground">Analyzing tokens and matching traits...</h3>
            </div>
         )}

         {result && (
            <div className="py-6 flex flex-col items-center space-y-6">
               <div className={`p-4 rounded-full ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {result.passed ? <CheckCircle2 className="w-16 h-16 text-green-500" /> : <AlertTriangle className="w-16 h-16 text-red-500" />}
               </div>
               
               <div className="text-center space-y-2">
                 <h2 className={`text-2xl font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                    {result.passed ? 'Shortlisted' : 'Rejected'}
                 </h2>
                 <p className="font-semibold text-lg text-muted-foreground">Match Score: <span className="text-foreground">{result.score}/100</span></p>
               </div>
               
               <div className="w-full max-w-lg bg-muted p-5 rounded-xl border relative shadow-inner">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 rounded-l-xl"></div>
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-2">Recruiter Feedback</span>
                  <p className="text-sm font-medium leading-relaxed italic text-foreground/90">"{result.feedback}"</p>
               </div>

               {result.passed && (
                  <p className="text-xs font-bold uppercase tracking-wider text-green-600 animate-pulse mt-4">Proceeding to Aptitude Round...</p>
               )}
            </div>
         )}
      </CardContent>
    </Card>
  );
}
