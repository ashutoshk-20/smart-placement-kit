"use client";

import React, { useState } from 'react';
import InterviewSession from '@/components/InterviewSession';
import AttentionTracker from '@/components/AttentionTracker';
import { useUser } from '@clerk/nextjs';
import { evaluateTechnicalInterviewFeedback } from '@/actions/placement';
import { toast } from 'sonner';
import { Loader2, Mic } from 'lucide-react';

export default function Step4Technical({ process, setProcess }) {
  const { user } = useUser();
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [started, setStarted] = useState(false);

  const username = user?.fullName || user?.firstName || "Candidate";
  const roomName = `tech-${process._id}-${Date.now()}`;

  const handleInterviewComplete = async (interviewResult, error) => {
      if (error || !interviewResult) {
          toast.error("Interview failed to save properly.");
          return;
      }
      setEvaluating(true);
      try {
          const updatedProcess = await evaluateTechnicalInterviewFeedback(process._id, interviewResult.feedback);
          if (!updatedProcess.technicalResult.passed) {
              toast.error("Did not pass the Technical Interview criteria.");
          } else {
              toast.success("Technical Interview cleared!");
          }
          setProcess(updatedProcess);
      } catch (err) {
          toast.error(err.message || "Failed to process interview result.");
      } finally {
          setEvaluating(false);
      }
  };

  if (evaluating) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl shadow-lg border-primary/20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold">Finalizing Technical Analysis...</h2>
              <p className="text-muted-foreground mt-2">Correlating interview transcript and feedback to placement thresholds.</p>
          </div>
      );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-muted/10 p-6 rounded-xl border border-primary/20 flex flex-col items-center text-center">
         <div className="p-4 rounded-full bg-secondary/10 mb-4">
             <Mic className="h-10 w-10 text-secondary" />
         </div>
         <h2 className="text-3xl text-primary font-bold">Round 4: Technical Interview</h2>
         <p className="text-muted-foreground mt-2 text-md max-w-xl mx-auto">
            You will now have a LiveKit real-time voice and video interview focusing on system design, logic, and deep technical questions for a <b>{process.role}</b>.
         </p>
         {!started && (
            <button 
                onClick={() => setStarted(true)}
                className="mt-6 px-10 py-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-full shadow-lg transition-transform hover:scale-105"
            >
                Start AI Technical Interview
            </button>
         )}
      </div>

      {started && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <InterviewSession 
                room={roomName} 
                username={username} 
                behavioralMetrics={feedback} 
                onComplete={handleInterviewComplete}
             />
             <div className="hidden">
                <AttentionTracker onFeedback={setFeedback} />
             </div>
          </div>
      )}
    </div>
  );
}
