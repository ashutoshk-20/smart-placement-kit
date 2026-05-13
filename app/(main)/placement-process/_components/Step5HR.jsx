"use client";

import React, { useState, useEffect } from 'react';
import InterviewSession from '@/components/InterviewSession';
import AttentionTracker from '@/components/AttentionTracker';
import { evaluateHRInterviewFeedback } from '@/actions/placement';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Step5HR({ process, setProcess }) {
  const [feedback, setFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [started, setStarted] = useState(false);

  const [username, setUsername] = useState("Candidate");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        JSON.parse(atob(token.split(".")[1]));
        setUsername("Candidate");
      } catch {}
    }
  }, []);

  const roomName = `hr-${process._id}-${Date.now()}`;

  const handleInterviewComplete = async (interviewResult, error) => {
    if (error || !interviewResult) {
      toast.error("Interview failed.");
      return;
    }

    setEvaluating(true);

    try {
      const updatedProcess = await evaluateHRInterviewFeedback(process._id, interviewResult.feedback);
      setProcess(updatedProcess);
      toast.success("HR Interview Completed");
    } catch {
      toast.error("Error processing result");
    } finally {
      setEvaluating(false);
    }
  };

  if (evaluating) return <Loader2 className="animate-spin" />;

  return (
    <div>
      {!started && (
        <button onClick={() => setStarted(true)}>
          Start HR Interview
        </button>
      )}

      {started && (
        <>
          <InterviewSession room={roomName} username={username} behavioralMetrics={feedback} onComplete={handleInterviewComplete} />
          <AttentionTracker onFeedback={setFeedback} />
        </>
      )}
    </div>
  );
}