"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mic, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import Quiz from '../_components/Quiz'
import InterviewSession from '@/components/InterviewSession'
import AttentionTracker from '@/components/AttentionTracker'

const MockInterviewPage = () => {
  const { user } = useUser();
  const [mode, setMode] = useState(null); // 'quiz' or 'ai'
  const [feedback, setFeedback] = useState(null);

  const username = user?.fullName || user?.firstName || "Candidate";
  const roomName = `interview-${user?.id || 'demo'}`;

  return (
    <div className='container mx-auto space-y-4 py-6'>
      <div className='flex flex-col space-y-2 mx-2 text-center md:text-left'>
        <Link href={"/interview"}>
          <Button variant={"link"} className={"gap-2 pl-0"}>
            <ArrowLeft className='h-4 w-4' />
            Back to Interview Preparation
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-title">Mock Interview</h1>
            <p className="text-muted-foreground">
              Prepare for your career with our advanced assessment tools.
            </p>
          </div>

          {mode && (
            <Button variant="outline" onClick={() => setMode(null)}>
              Switch Mode
            </Button>
          )}
        </div>
      </div>

      {!mode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 px-2">
          <div
            className="group relative p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
            onClick={() => setMode('quiz')}
          >
            <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <BrainCircuit className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Technical & Aptitude Quiz</h2>
            <p className="text-muted-foreground">
              Multiple choice questions tailored to your industry and skills. Get instant feedback and improvement tips.
            </p>
            <Button className="w-full">Start Quiz</Button>
          </div>

          <div
            className="group relative p-8 rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center text-center space-y-4"
            onClick={() => setMode('ai')}
          >
            <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Mic className="h-12 w-12 text-secondary" />
            </div>
            <h2 className="text-2xl font-semibold">AI Avatar Mock Interview</h2>
            <p className="text-muted-foreground">
              Experience a real-time conversation with our AI interviewer. Uses LiveKit for a seamless voice and video experience.
            </p>
            <Button variant="secondary" className="w-full">Start AI Interview</Button>
          </div>
        </div>
      ) : mode === 'quiz' ? (
        <>
          <Quiz />
          <AttentionTracker onFeedback={setFeedback} />
        </>
      ) : (
        <div className="mt-8">
          <InterviewSession room={roomName} username={username} />
          <AttentionTracker onFeedback={setFeedback} />
        </div>
      )}
    </div>
  )
}

export default MockInterviewPage