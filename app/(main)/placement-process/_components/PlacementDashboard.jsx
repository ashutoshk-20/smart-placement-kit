"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Briefcase, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function PlacementDashboard({ processes }) {
  if (!processes || processes.length === 0) {
    return (
      <Card className="w-full max-w-3xl border-primary/20 shadow-xl bg-card text-center p-12">
        <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <CardTitle className="text-2xl font-bold mb-2">No Applications Yet</CardTitle>
        <CardDescription className="mb-6">Start your first end-to-end placement simulation process.</CardDescription>
        <Link href="?new=true">
          <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-md shadow-lg">
             <Plus className="w-5 h-5 mr-2" /> Start New Application
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
       <div className="flex justify-between items-center bg-muted/10 p-6 rounded-xl border border-primary/20 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold">Your Applications</h2>
            <p className="text-muted-foreground mt-1">Track and resume your interview processes.</p>
          </div>
          <Link href="?new=true">
            <Button className="shadow-lg hover:scale-[1.02] transition-transform font-bold px-6">
               <Plus className="w-4 h-4 mr-2 text-white" /> Start New
            </Button>
          </Link>
       </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {processes.map((p) => {
            const isCompleted = p.status === 'completed';
            const isFailed = p.status === 'failed';
            const isInProgress = p.status === 'in_progress';
            
            return (
              <Card key={p._id} className={`hover:border-primary/50 transition-colors shadow-md ${isCompleted ? 'border-green-500/30 bg-green-50/5 dark:bg-green-950/10' : isFailed ? 'border-red-500/30 bg-red-50/5 dark:bg-red-950/10' : ''}`}>
                 <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex flex-col gap-2">
                       <div className="flex justify-between items-start">
                         <CardTitle className="text-lg font-bold leading-tight">
                            {p.role} 
                         </CardTitle>
                         <Badge variant={isCompleted ? "default" : isFailed ? "destructive" : "secondary"} className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}>
                            {isCompleted ? "Hired" : isFailed ? "Rejected" : "In Progress"}
                         </Badge>
                       </div>
                       <CardDescription className="text-xs font-mono">
                          {p.createdAt && !isNaN(new Date(p.createdAt).getTime()) ? formatDistanceToNow(new Date(p.createdAt), { addSuffix: true }) : "Recently"}
                       </CardDescription>
                    </div>
                 </CardHeader>
                 <CardContent className="pt-4 flex flex-col justify-between h-[120px]">
                    <div className="space-y-2 text-sm text-foreground/80">
                       <div className="flex items-center gap-2 font-medium">
                           {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : isFailed ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-blue-500 animate-pulse" />}
                           <span className="font-bold">Stage {p.currentStep}:</span> 
                           {p.currentStep === 1 && "Resume Check"}
                           {p.currentStep === 2 && "Aptitude"}
                           {p.currentStep === 3 && "Coding Challenge"}
                           {p.currentStep === 4 && "System Design API"}
                           {p.currentStep === 5 && "HR & Cultural"}
                       </div>
                       <p className="line-clamp-1 italic indent-6 opacity-70 text-xs mt-1">
                          Role Target: {p.salary}
                       </p>
                    </div>
                    
                    <Link href={`?id=${p._id}`} className="mt-4">
                       <Button variant={isInProgress ? 'default' : 'outline'} className={`w-full ${isInProgress ? 'bg-primary/90 font-bold' : ''}`}>
                         {isInProgress ? "Resume Process" : "View Details"}
                         <ChevronRight className="w-4 h-4 ml-2" />
                       </Button>
                    </Link>
                 </CardContent>
              </Card>
            );
         })}
       </div>
    </div>
  );
}
