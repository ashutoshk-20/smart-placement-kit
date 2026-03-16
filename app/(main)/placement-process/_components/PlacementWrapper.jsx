"use client";

import React, { useState } from 'react';
import Step0Input from './Step0Input';
import Step1Shortlist from './Step1Shortlist';
import Step2Aptitude from './Step2Aptitude';
import Step3Coding from './Step3Coding';
import Step4Technical from './Step4Technical';
import Step5HR from './Step5HR';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function PlacementWrapper({ initialProcess }) {
  const [process, setProcess] = useState(initialProcess);

  if (!process) {
    return <Step0Input onProcessCreated={(p) => setProcess(p)} />;
  }

  if (process.status === 'failed') {
    return (
      <Card className="w-full max-w-2xl border-red-500/50 mt-10 shadow-2xl">
        <CardHeader className="text-center bg-red-950/20 py-8 border-b border-red-900/50">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-3xl text-red-500">Recruitment Process Ended</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 text-center space-y-4">
          <p className="text-xl text-muted-foreground">Unfortunately, you did not pass the current stage.</p>
          <div className="bg-muted p-4 rounded-lg">
            <span className="font-semibold block mb-2 text-primary">Last Stage Feedback:</span>
            {process.hrResult?.feedback ||
              process.technicalResult?.feedback ||
              process.codingResult?.feedback ||
              process.aptitudeResult?.feedback ||
              process.resumeShortlistResult?.feedback ||
              "No detailed feedback available."}
          </div>
          <Link href="/placement-process">
            <Button className="mt-6" variant="outline">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (process.status === 'completed') {
    return (
      <Card className="w-full max-w-2xl border-green-500/50 mt-10 shadow-2xl">
        <CardHeader className="text-center bg-green-950/20 py-8 border-b border-green-900/50">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
          <CardTitle className="text-3xl text-green-500">Congratulations! You're Hired!</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 text-center space-y-4">
          <p className="text-xl text-muted-foreground">You successfully cleared all rounds for the <span className="text-primary font-bold">{process.role}</span> position.</p>
          <Link href="/placement-process">
            <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white shadow-lg">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full flex gap-8 relative items-start">
      {/* Sidebar timeline indicator */}
      <div className="hidden lg:flex flex-col gap-2 w-64 shrink-0 top-12 sticky border rounded-xl p-4 bg-card shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-center border-b pb-2">Stages</h3>
        {[
          { step: 1, name: "Shortlisting" },
          { step: 2, name: "Aptitude" },
          { step: 3, name: "Coding" },
          { step: 4, name: "Technical" },
          { step: 5, name: "HR Interview" },
        ].map((s) => (
          <div key={s.step} className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${process.currentStep === s.step ? "bg-primary text-primary-foreground shadow" : process.currentStep > s.step ? "bg-green-100/10 text-green-500 dark:text-green-400 opacity-60" : "bg-muted/50 text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${process.currentStep === s.step ? "bg-white text-primary" : process.currentStep > s.step ? "bg-green-500 text-white" : "bg-muted-foreground/30"}`}>
              {process.currentStep > s.step ? "✓" : s.step}
            </div>
            <span className="font-semibold">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full min-w-0">
        {process.currentStep === 1 && <Step1Shortlist process={process} setProcess={setProcess} />}
        {process.currentStep === 2 && <Step2Aptitude process={process} setProcess={setProcess} />}
        {process.currentStep === 3 && <Step3Coding process={process} setProcess={setProcess} />}
        {process.currentStep === 4 && <Step4Technical process={process} setProcess={setProcess} />}
        {process.currentStep === 5 && <Step5HR process={process} setProcess={setProcess} />}
      </div>
    </div>
  );
}
