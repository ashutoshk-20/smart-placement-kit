"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Check, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteCoverLetter } from '@/actions/cover-letter';
import Link from 'next/link';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDMarkdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false });

export default function CoverLetterViewer({ letter }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // We load the existing saved AI content
  const [content, setContent] = useState(letter.content || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Cover letter copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cover letter? This action cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await deleteCoverLetter(letter._id);
      toast.success("Cover letter deleted successfully");
      router.refresh();
      router.push("/ai-cover-letter");
    } catch (error) {
      toast.error(error.message || "Failed to delete cover letter");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <Link href="/ai-cover-letter">
          <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Cover Letters
          </Button>
       </Link>

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
          <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                 {letter.jobTitle}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                  <span className="font-semibold text-foreground/80">{letter.companyName}</span>
                  <span>•</span>
                  <span>Generated on {new Date(letter.createdAt).toLocaleDateString()}</span>
                  <Badge variant="outline" className="ml-2 bg-primary/5 text-primary">
                     {letter.status === "completed" ? "Ready" : "Draft"}
                  </Badge>
              </div>
          </div>
          <div className="flex items-center gap-3">
              <Button 
                onClick={handleCopy} 
                variant="outline"
                className="bg-background"
              >
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="destructive"
                disabled={isDeleting}
              >
                  {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
              </Button>
          </div>
       </div>

       <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="bg-muted/40 px-6 py-3 border-b border-border/50 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Letter Content</span>
          </div>
          <div className="p-6 md:p-10 prose prose-sm md:prose-base dark:prose-invert max-w-none bg-background">
             <MDMarkdown source={content} />
          </div>
       </div>
    </div>
  );
}
