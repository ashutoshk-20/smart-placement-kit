"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Step2Aptitude({ process, setProcess }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 🔁 Fetch from YOUR backend instead of AI
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch("https://apti-platform.onrender.com/api/questions");
                const data = await res.json();

                const formatted = data.map(q => ({
                    id: q.id,
                    question: q.question,
                    options: [
                        { label: "A", value: q.option_a },
                        { label: "B", value: q.option_b },
                        { label: "C", value: q.option_c },
                        { label: "D", value: q.option_d }
                    ],
                    correctAnswer: q.answer
                }));

                setQuizData(formatted);
                setAnswers(new Array(formatted.length).fill(null));
            } catch (err) {
                console.error(err);
                toast.error("Failed to load questions");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswer = (answer) => {
        const newAnswer = [...answers];
        newAnswer[currentQuestion] = answer;
        setAnswers(newAnswer);
    };

    const handleNext = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        let correct = 0;
        setSaving(true);

        try {
            for (let i = 0; i < quizData.length; i++) {
                const res = await fetch("https://apti-platform.onrender.com/api/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id: quizData[i].id,
                        selected: answers[i]
                    })
                });

                const data = await res.json();
                if (data.is_correct) correct++;
            }

            if (correct < quizData.length / 2) {
                toast.error("You did not pass the aptitude round.");
            } else {
                toast.success("Aptitude round cleared!");
            }

        } catch (error) {
            toast.error("Failed to submit answers");
        } finally {
            setSaving(false);
        }
    };

    // ✅ SAME UI (only loading condition changed)
    if (loading || !quizData) {
        return (
            <Card className="w-full text-center py-12 shadow-md">
               <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
               <CardTitle>Loading Aptitude Test</CardTitle>
               <p className="text-muted-foreground mt-2">
                   Preparing your questions...
               </p>
            </Card>
        );
    }

    const question = quizData[currentQuestion];

    return (
        <Card className="w-full shadow-lg border-primary/20">
            <CardHeader className="bg-muted/10 border-b pb-6">
                <div className="flex justify-between items-center">
                   <CardTitle className="text-2xl text-primary">
                       Round 2: Aptitude
                   </CardTitle>
                   <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                      Question {currentQuestion + 1} of {quizData.length}
                   </span>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                <p className="text-xl font-medium leading-relaxed">
                    {question.question}
                </p>

                <RadioGroup
                    value={answers[currentQuestion]}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                >
                    {question.options.map((option, index) => (
                        <div
                            key={index}
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                                answers[currentQuestion] === option.label
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-primary/50'
                            }`}
                        >
                            <RadioGroupItem value={option.label} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                               {option.label}. {option.value}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>

            <CardFooter className="bg-muted/5 py-4 border-t flex justify-end">
                <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion] || saving}
                    size="lg"
                    className="px-8 shadow-md"
                >
                    {saving && <Loader2 className="mr-2 animate-spin w-5 h-5" />}
                    {currentQuestion < quizData.length - 1 ? "Next Question" : "Finish Test"}
                </Button>
            </CardFooter>
        </Card>
    );
}