"use client";

import { Button } from '@/components/ui/button'
import { ArrowLeft, Mic, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import Quiz from '../_components/Quiz'
import InterviewSession from '@/components/InterviewSession'
import AttentionTracker from '@/components/AttentionTracker'

const MockInterviewPage = () => {
  const [mode, setMode] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [username, setUsername] = useState("Candidate");
  const [userId, setUserId] = useState("demo");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded.userId);
      setUsername("Candidate");
    } catch {}
  }, []);

  const roomName = `interview-${userId}`;

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
          <div onClick={() => setMode('quiz')} className="cursor-pointer">
            <Button className="w-full">Start Quiz</Button>
          </div>

          <div onClick={() => setMode('ai')} className="cursor-pointer">
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
          <InterviewSession room={roomName} username={username} behavioralMetrics={feedback} />
          <AttentionTracker onFeedback={setFeedback} />
        </div>
      )}
    </div>
  )
}

export default MockInterviewPage;