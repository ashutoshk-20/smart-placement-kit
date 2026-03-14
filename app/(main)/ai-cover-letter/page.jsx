import { getCoverLetters } from '@/actions/cover-letter';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, FileText, ArrowRight } from 'lucide-react';
import CoverLetterGenerator from './_components/CoverLetterGenerator';

export const metadata = {
  title: "AI Cover Letters | SoftStart",
  description: "Generate tailored cover letters automatically",
};

export default async function AICoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-10 text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                AI Cover <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Letter Generator</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop writing generic letters. Use AI to instantly draft high-converting cover letters perfectly tailored to any job description.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Generator Form */}
            <div className="order-2 lg:order-1 flex flex-col items-center">
                <CoverLetterGenerator />
            </div>

            {/* Right: History */}
            <div className="order-1 lg:order-2 space-y-6">
                <div className="flex items-center gap-3 mb-2 pb-2 border-b">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className='text-2xl font-bold tracking-tight'>Your Drafts</h2>
                </div>

                {coverLetters && coverLetters.length > 0 ? (
                    <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 pb-10">
                        {coverLetters.map((letter) => (
                            <Card key={letter._id} className="bg-muted/10 hover:bg-muted/30 transition-colors group border-primary/10 hover:border-primary/30">
                                <CardHeader className="py-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{letter.jobTitle}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <span className="font-semibold text-foreground">{letter.companyName}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span>{formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardFooter className="pt-0 flex justify-between">
                                    <Badge variant={letter.status === "completed" ? "default" : "outline"}>
                                        {letter.status === "completed" ? "Ready" : "Draft"}
                                    </Badge>
                                    <Link href={`/ai-cover-letter/${letter._id}`}>
                                        <div className="text-sm font-medium text-primary flex items-center gap-1 group-hover:underline">
                                           View Document <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-16 text-center border-2 border-dashed rounded-xl border-muted flex flex-col items-center justify-center bg-muted/5">
                        <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Cover Letters yet</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">You haven't generated any cover letters. Use the tool on the left to create your first one!</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}