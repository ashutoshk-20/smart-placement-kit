import React from 'react';
import PlacementWrapper from './_components/PlacementWrapper';
import PlacementDashboard from './_components/PlacementDashboard';
import { getPlacementProcess, getUserPlacementProcesses } from '@/actions/placement';

export const metadata = {
  title: "Placement Process | SoftStart",
  description: "End-to-end interview simulation process",
};

export default async function PlacementProcessPage({ searchParams }) {
  // We can pass a processId via searchParams if we want to resume
  const resolvedSearchParams = await searchParams;
  const processId = resolvedSearchParams?.id || null;
  const isNew = resolvedSearchParams?.new === 'true';

  let initialProcess = null;
  if (processId) {
    initialProcess = await getPlacementProcess(processId);
  }

  // If no specific process ID is selected and they didn't explicitly click 'Start New', show history dashboard
  const showDashboard = !processId && !isNew;
  
  let processes = [];
  if (showDashboard) {
    processes = await getUserPlacementProcesses();
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto space-y-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold gradient-title text-center mb-6 mt-4">
          End-to-End Interview Process
        </h1>
        {showDashboard ? (
          <PlacementDashboard processes={processes} />
        ) : (
          <PlacementWrapper initialProcess={initialProcess} />
        )}
      </div>
    </div>
  );
}
