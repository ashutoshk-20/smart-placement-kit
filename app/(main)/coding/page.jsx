import React from 'react';
import CodingChallenge from './_components/CodingChallenge';
import { getCodingAssessments } from '@/actions/coding';

export const metadata = {
  title: "Coding Assessment | SoftStart",
  description: "Assess algorithmic thinking and problem-solving skills",
};

export default async function CodingPage() {
  const codingAssessments = await getCodingAssessments();

  // Guard: make sure it's always an array
  const safeAssessments = Array.isArray(codingAssessments) 
    ? codingAssessments 
    : [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-80px)] overflow-y-auto">
      <CodingChallenge codingAssessments={safeAssessments} />
    </div>
  );
}