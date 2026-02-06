import { getAssessment } from '@/actions/interview'
import { getMockInterviews } from '@/actions/mock-interview';
import React from 'react'
import StatsCard from './_components/StatsCard';
import PerformanceChart from './_components/PerformanceChart';
import QuizList from './_components/QuizList';
import MockInterviewList from './_components/MockInterviewList';

const InterviewPage = async () => {

  const [assessments, interviews] = await Promise.all([
    getAssessment(),
    getMockInterviews()
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold gradient-title">
          Interview Preparation
        </h1>
      </div>

      <div className='space-y-6'>
        <StatsCard assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
        <MockInterviewList interviews={interviews} />
      </div>

    </div>
  )
}

export default InterviewPage