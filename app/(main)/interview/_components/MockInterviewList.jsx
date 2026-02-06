"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Brain, MessageSquare, Video, Star, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const MockInterviewList = ({ interviews }) => {
    const [selectedInterview, setSelectedInterview] = useState(null);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle className="gradient-title text-3xl md:text-4xl">
                            AI Mock Interviews
                        </CardTitle>
                        <CardDescription>
                            Review your AI-powered interview sessions and behavioral insights
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {interviews.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                <Video className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No interview sessions recorded yet.</p>
                            </div>
                        ) : (
                            interviews.map((interview, i) => (
                                <Card key={interview._id}
                                    className="cursor-pointer hover:bg-muted/50 transition-all border-l-4 border-l-primary/40"
                                    onClick={() => setSelectedInterview(interview)}
                                >
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl flex items-center gap-2">
                                                    Session #{interviews.length - i}
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {format(new Date(interview.createdAt), "MMM dd, yyyy")}
                                                    </Badge>
                                                </CardTitle>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 text-yellow-500" />
                                                        Score: {interview.feedback?.overallScore || 0}%
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Brain className="h-3 w-3 text-primary" />
                                                        Confidence: {interview.behavioralMetrics?.confidence || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge variant={interview.feedback?.overallScore > 70 ? "default" : "secondary"}>
                                                {interview.feedback?.overallScore > 70 ? "Excellent" : "Needs Practice"}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-primary/20">
                    <DialogHeader className="p-6 bg-primary text-primary-foreground">
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <Video className="h-6 w-6" />
                            Interview Analysis Report
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="h-[calc(90vh-80px)] p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-muted rounded-xl text-center space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                                <p className="text-4xl font-bold text-primary">{selectedInterview?.feedback?.overallScore}%</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl text-center space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Behavioral Avg</p>
                                <p className="text-4xl font-bold text-primary">
                                    {Math.round((selectedInterview?.behavioralMetrics?.confidence + selectedInterview?.behavioralMetrics?.eyeContact + selectedInterview?.behavioralMetrics?.posture) / 3 || 0)}%
                                </p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl text-center space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Tone</p>
                                <p className="text-lg font-semibold text-primary capitalize">{selectedInterview?.feedback?.tone || "Neutral"}</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    AI Content Feedback
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {selectedInterview?.feedback?.contentFeedback}
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Key Improvement Tips
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {selectedInterview?.feedback?.improvementTips.map((tip, idx) => (
                                        <div key={idx} className="flex gap-3 text-sm p-3 bg-primary/5 rounded-lg border border-primary/10">
                                            <span className="font-bold text-primary">{idx + 1}.</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Conversation Transcript
                                </h3>
                                <div className="space-y-4 pt-2">
                                    {selectedInterview?.transcript.map((msg, idx) => (
                                        <div key={idx} className={`flex flex-col ${msg.role === 'candidate' ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'candidate'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-muted rounded-tl-none'
                                                }`}>
                                                <p className="font-bold text-[10px] uppercase mb-1 opacity-70">
                                                    {msg.role === 'candidate' ? 'You' : 'AI Interviewer'}
                                                </p>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MockInterviewList;
