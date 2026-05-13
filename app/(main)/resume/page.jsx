import { getResume } from '@/actions/resume';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import ResumeBuilder from './_components/ResumeBuilder';

const ResumePage = async () => {

    // ✅ CHECK AUTH FIRST
    const userId = await getUserIdFromRequest();

    if (!userId) {
        redirect("/login");
    }

    // ✅ SAFE TO CALL ACTION
    const resume = await getResume();

    return (
        <div className='container mx-auto py-6'>
            <ResumeBuilder initalContent={resume?.content} />
        </div>
    );
};

export default ResumePage;