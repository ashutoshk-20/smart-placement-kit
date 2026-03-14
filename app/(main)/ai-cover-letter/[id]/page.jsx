import { getCoverLetter } from '@/actions/cover-letter';
import CoverLetterViewer from './_components/CoverLetterViewer';

export const metadata = {
  title: "Cover Letter View | SoftStart",
  description: "View and edit your AI generated cover letter.",
};

export default async function CoverLetter({ params }) {
    const { id } = await params;
    
    // Fetch the cover letter statically for the user
    // It throws an error gracefully if Unauthenticated/Not Found
    const letter = await getCoverLetter(id);

    return (
        <CoverLetterViewer letter={letter} />
    );
}