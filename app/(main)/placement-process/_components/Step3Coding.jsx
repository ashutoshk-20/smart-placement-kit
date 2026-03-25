"use client";

import React, { useState } from 'react';
import CodingChallenge from '../../coding/_components/CodingChallenge';
import { advanceToTechnical } from '@/actions/placement';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Step3Coding({ process, setProcess }) {
  const [advancing, setAdvancing] = useState(false);

  // We determine difficulty based on salary text
  const getDifficulty = () => {
    const s = (process.salary || "").toLowerCase();
    if (s.includes("15") || s.includes("20") || s.includes("hard")) return "Hard";
    if (s.includes("5") || s.includes("3") || s.includes("easy")) return "Easy";
    return "Medium"; // default
  };

  const difficulty = getDifficulty();

  const handleAssessmentComplete = async (assessment) => {
  setAdvancing(true);

  try {
    if (!assessment.passed) {
      toast.error("Coding round failed");

      setProcess({
        ...process,
        status: "failed"
      });
    } else {
      toast.success("Coding round cleared!");

      setProcess({
        ...process,
        currentStep: 4 // 🔥 move to technical
      });
    }

  } catch (error) {
    toast.error("Error in coding step");
  } finally {
    setAdvancing(false);
  }
};

  if (advancing) {
      return (
          <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl shadow-lg border-primary/20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold">Evaluating Performance...</h2>
              <p className="text-muted-foreground mt-2">Checking time and space complexity results against requirements.</p>
          </div>
      );
  }

  return (
    <div className="w-full">
      <div className="bg-muted/10 p-6 rounded-t-xl border border-b-0 border-primary/20 mb-[-10px] z-10 relative">
         <h2 className="text-2xl text-primary font-bold">Round 3: Coding Assessment</h2>
         <p className="text-muted-foreground mt-2 text-sm">
            Based on the role <b>{process.role}</b> and salary expectation, your assigned difficulty is: 
            <span className="font-bold text-foreground mx-1">{difficulty}</span>
         </p>
      </div>
      {/* 
        We pass fixedDifficulty to force locking the difficulty 
        and provide an onComplete callback to hijack the redirect. 
      */}
      <CodingChallenge 
         codingAssessments={[]} 
         defaultDifficulty={difficulty} 
         fixedDifficulty={true}
         onComplete={handleAssessmentComplete} 
      />
    </div>
  );
}
