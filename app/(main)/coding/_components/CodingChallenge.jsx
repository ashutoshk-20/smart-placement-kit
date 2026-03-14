"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Code, ChevronRight, List, CheckCircle2, XCircle, ArrowRight, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from "date-fns";
import { generateCodingChallenges, runCodeTest, submitCodingAssessment } from '@/actions/coding';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Editor from '@monaco-editor/react';
import "@/app/globals.css"; // Ensure global styles apply

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDMarkdown = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default.Markdown), { ssr: false });

export default function CodingChallenge({ codingAssessments = [] }) {
  const [difficulty, setDifficulty] = useState("Medium");
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [challenges, setChallenges] = useState(null); 
  
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [userCodes, setUserCodes] = useState({});
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setChallenges(null);
    try {
      const result = await generateCodingChallenges(difficulty);
      setChallenges(result);
      
      const initialCodes = {};
      result.forEach((chal, i) => {
        initialCodes[i] = {
           javascript: chal.starterCode?.javascript || "// Write your javascript code here...",
           python: chal.starterCode?.python || "# Write your python code here...",
           java: chal.starterCode?.java || "// Write your java code here...",
           cpp: chal.starterCode?.cpp || "// Write your c++ code here..."
        };
      });
      setUserCodes(initialCodes);
      toast.success("DSA questions generated!");
    } catch (error) {
      toast.error(error.message || "Failed to generate challenges. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (val) => {
     setUserCodes(prev => ({
       ...prev,
       [activeChallengeIndex]: {
          ...prev[activeChallengeIndex],
          [activeLanguage]: val || ""
       }
     }));
  };

  const handleRunTests = async () => {
     const currentCode = userCodes[activeChallengeIndex]?.[activeLanguage];
     if (!currentCode) return toast.error("Write some code first!");
     
     setIsRunningTests(true);
     try {
       const results = await runCodeTest(challenges[activeChallengeIndex], currentCode, activeLanguage);
       setTestResults(prev => ({
         ...prev,
         [activeChallengeIndex]: results
       }));
       toast.success("Tests executed!");
     } catch (err) {
       toast.error("Failed to run tests.");
     } finally {
       setIsRunningTests(false);
     }
  };

  const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await submitCodingAssessment(challenges, userCodes, difficulty);
        toast.success("Assessment submitted successfully!");
        setChallenges(null);
        router.refresh();
      } catch (err) {
         toast.error("Failed to submit assessment.");
      } finally {
         setIsSubmitting(false);
      }
  };

  if (!challenges) {
    return (
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6 order-2 lg:order-1 flex flex-col items-center lg:items-start" style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto", paddingRight: "10px" }}>
            <div className="flex items-center gap-3 mb-2 sticky top-0 bg-background/95 backdrop-blur py-2 w-full z-10 border-b">
                <Code className="h-6 w-6 text-primary" />
                <h2 className='text-2xl font-bold tracking-tight'>Evaluation History</h2>
            </div>
            {codingAssessments && codingAssessments.length > 0 ? (
                <div className='w-full space-y-4'>
                    {codingAssessments.map((assessment, i) => {
                        const isExpanded = expandedHistoryIndex === i;
                        return (
                            <Card 
                                key={i} 
                                className={`flex flex-col bg-muted/20 hover:bg-muted/40 transition-colors border-primary/20 cursor-pointer overflow-hidden ${isExpanded ? 'shadow-md border-primary/40' : ''}`}
                                onClick={() => setExpandedHistoryIndex(isExpanded ? null : i)}
                            >
                                <CardHeader className="py-4 px-5">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                              Test #{codingAssessments.length - i}
                                              <Badge variant={assessment.overallScore >= 80 ? "default" : assessment.overallScore >= 50 ? "secondary" : "destructive"} className="ml-2">
                                                  {assessment.overallScore}/100
                                              </Badge>
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {formatDistanceToNow(new Date(assessment.createdAt), { addSuffix: true })} • {assessment.difficulty}
                                            </CardDescription>
                                        </div>
                                        <div className="text-muted-foreground p-2 bg-background rounded-full hover:bg-muted">
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5"/>}
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {isExpanded && (
                                    <CardContent className="flex-1 flex flex-col gap-4 px-5 pb-5 pt-0 border-t border-border/50 bg-background/50">
                                        <p className="text-sm text-foreground/90 mt-4 leading-relaxed font-medium">
                                            {assessment.feedback || "No general feedback provided."}
                                        </p>
                                        
                                        {assessment.challenges && assessment.challenges.length > 0 && (
                                            <div className="space-y-3 mt-2">
                                                {assessment.challenges.map((chal, cIdx) => (
                                                    <div key={cIdx} className="bg-muted/50 p-3 rounded-lg border border-border/50 text-sm">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-semibold">{chal.title}</span>
                                                            {chal.evaluation && chal.evaluation.passed !== undefined && (
                                                                <Badge variant={chal.evaluation.passed ? "outline" : "destructive"} className={chal.evaluation.passed ? "border-green-500 text-green-600 bg-green-500/10" : "bg-red-500/10"}>
                                                                    {chal.evaluation.passed ? "Passed" : "Failed"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {chal.evaluation && chal.evaluation.comments ? (
                                                            <p className="text-xs text-muted-foreground">{chal.evaluation.comments}</p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No specific comments.</p>
                                                        )}
                                                        {chal.evaluation && chal.evaluation.timeComplexity && (
                                                            <div className="mt-3 flex gap-4 text-[11px] font-mono font-medium text-muted-foreground/80 bg-background/80 w-fit px-2 py-1 rounded">
                                                                <span className="flex items-center gap-1"><span className="text-foreground/50">Time:</span> {chal.evaluation.timeComplexity}</span>
                                                                <span className="flex items-center gap-1"><span className="text-foreground/50">Space:</span> {chal.evaluation.spaceComplexity}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {assessment.improvementTips && assessment.improvementTips.length > 0 && (
                                            <div className="mt-2 text-sm bg-blue-500/5 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-900/50">
                                                <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
                                                    <AlertCircle className="w-4 h-4" /> Areas for Improvement
                                                </h4>
                                                <ul className="list-disc pl-5 space-y-1.5 marker:text-blue-400/70">
                                                    {assessment.improvementTips.map((tip, idx) => (
                                                        <li key={idx} className="text-muted-foreground/90">{tip}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="w-full py-16 text-center border-2 border-dashed rounded-xl border-muted flex flex-col items-center justify-center opacity-70">
                    <Code className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">No previous assessments found</p>
                    <p className="text-xs text-muted-foreground mt-1">Take your first test on the right!</p>
                </div>
            )}
        </div>

        <div className="order-1 lg:order-2">
            <Card className="shadow-xl shadow-primary/5 border-primary/20 sticky top-12">
              <CardHeader className="text-center pb-8 border-b bg-muted/10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-primary/20">
                   <Code className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">New Assessment</CardTitle>
                <CardDescription className="mx-8 mt-3 text-base">
                  Sharpen your algorithmic thinking and programming skills with custom Data Structures and Algorithms questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 px-10 pt-8 pb-10">
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-foreground/80 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      Select Difficulty Range
                  </Label>
                  <div className="grid grid-cols-3 gap-4 font-medium">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                      <div 
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`cursor-pointer border-2 rounded-xl py-4 select-none text-center transition-all duration-300 ${difficulty === level ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 transform scale-[1.03] ring-2 ring-primary ring-offset-2 ring-offset-background' : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/50'}`}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading} 
                  size="lg"
                  className="w-full h-14 text-lg font-bold shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-indigo-500/25 transition-all group"
                >
                  {loading ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <ChevronRight className="w-6 h-6 mr-2 group-hover:translate-x-1 transition-transform" />}
                  {loading ? "Generating Output..." : `Start ${difficulty} Assessment`}
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  const activeChallenge = challenges[activeChallengeIndex];
  const userCode = userCodes[activeChallengeIndex]?.[activeLanguage] || "";

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden shadow-2xl bg-background mt-2">
      <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/40 shadow-sm z-10">
        <div className="flex items-center gap-3 bg-secondary/30 p-1 rounded-lg">
           {challenges.map((chal, i) => (
             <Button 
                key={i} 
                variant={activeChallengeIndex === i ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveChallengeIndex(i)}
                className={`transition-colors ${activeChallengeIndex === i ? "shadow-md px-6 py-4" : "text-muted-foreground hover:text-foreground px-4"}`}
             >
                <List className="w-4 h-4 mr-2" />
                Problem {i + 1}
             </Button>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <Badge variant={activeChallenge.difficulty === "Easy" ? "secondary" : activeChallenge.difficulty === "Medium" ? "default" : "destructive"} className="uppercase tracking-wider px-3 py-1 font-bold">
              {activeChallenge.difficulty}
           </Badge>
           <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30" size="sm" onClick={() => setChallenges(null)}>Close</Button>
           <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={isSubmitting || isRunningTests}
                className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 font-semibold px-6 transition-colors"
             >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Assessment
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="w-[45%] flex flex-col border-r bg-card overflow-y-auto">
          <div className="p-8 prose prose-sm md:prose-base dark:prose-invert max-w-none">
             <h1 className="mt-0 text-3xl font-bold tracking-tight mb-6">{activeChallenge.title}</h1>
             
             <div className="text-muted-foreground bg-primary/5 p-4 py-1 rounded-lg border-l-4 border-l-primary mb-6">
                <MDMarkdown 
                  source={activeChallenge.description} 
                  style={{ background: 'transparent', color: 'inherit' }}
                />
             </div>
             
             <div className="mt-8 flex gap-4 w-full">
                 <div className="flex-1 bg-muted/30 p-5 rounded-lg border shadow-sm">
                   <h4 className="font-semibold text-primary/80 mb-2 mt-0 uppercase tracking-wide text-xs">Input Format</h4>
                   <p className="text-sm">{activeChallenge.inputFormat}</p>
                 </div>
                 
                 <div className="flex-1 bg-muted/30 p-5 rounded-lg border shadow-sm">
                   <h4 className="font-semibold text-primary/80 mb-2 mt-0 uppercase tracking-wide text-xs">Output Format</h4>
                   <p className="text-sm m-0">{activeChallenge.outputFormat}</p>
                 </div>
             </div>

             <div className="mt-10">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                   Test Cases
                </h3>
                <div className="space-y-8">
                  {activeChallenge.testCases && activeChallenge.testCases.map((tc, idx) => (
                    <div key={idx} className="bg-muted/10 p-5 rounded-xl border border-muted/60 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                       <p className="font-semibold text-lg mb-4 text-foreground/80">Example {idx + 1}</p>
                       <div className="flex flex-col gap-3 text-sm font-mono">
                          <div className="bg-background border p-3 rounded-md">
                            <span className="text-muted-foreground select-none block text-xs uppercase mb-1 font-sans font-semibold tracking-wider">Input:</span>
                            <span className="text-green-600 dark:text-green-400">{tc.input}</span>
                          </div>
                          <div className="bg-background border p-3 rounded-md">
                            <span className="text-muted-foreground select-none block text-xs uppercase mb-1 font-sans font-semibold tracking-wider">Expected Output:</span>
                            <span className="text-blue-600 dark:text-blue-400">{tc.expectedOutput}</span>
                          </div>
                       </div>
                       {tc.explanation && (
                         <div className="mt-4 text-sm text-foreground/70 bg-secondary/20 p-3 rounded border border-secondary/30">
                            <span className="font-bold text-foreground">Explanation:</span> {tc.explanation}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
             </div>

             {activeChallenge.constraints && activeChallenge.constraints.length > 0 && (
                <div className="mt-10 bg-muted/20 p-5 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-3">Constraints:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {activeChallenge.constraints.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded w-fit">{c}</li>
                    ))}
                  </ul>
                </div>
             )}

             {activeChallenge.hints && activeChallenge.hints.length > 0 && (
                <div className="mt-8 mb-8">
                  <details className="cursor-pointer group">
                    <summary className="font-semibold p-3 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-200/50 dark:border-blue-800/50 flex justify-between items-center">
                       <span>Reveal Hints</span>
                       <span className="text-sm opacity-50 font-normal">({activeChallenge.hints.length} hints available)</span>
                    </summary>
                    <ul className="list-decimal pl-8 mt-4 space-y-3 text-sm border-l-2 border-blue-200 dark:border-blue-800 ml-4">
                      {activeChallenge.hints.map((hint, i) => (
                        <li key={i} className="pl-2">{hint}</li>
                      ))}
                    </ul>
                  </details>
                </div>
             )}
          </div>
        </div>

        <div className="w-[55%] flex flex-col bg-[#1e1e1e]">
           
           <div className="flex items-center justify-between px-6 py-3 bg-[#2d2d2d] border-b border-[#404040]">
              <div className="flex items-center gap-3">
                 <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold select-none">Language</span>
                 <select 
                   value={activeLanguage}
                   onChange={(e) => setActiveLanguage(e.target.value)}
                   className="bg-[#1e1e1e] text-gray-200 text-sm font-medium border border-[#404040] rounded px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer shadow-inner"
                 >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                 </select>
                 <span className="ml-4 text-xs font-mono text-gray-500">main.{activeLanguage === 'javascript' ? 'js' : activeLanguage === 'python' ? 'py' : activeLanguage === 'cpp' ? 'cpp' : 'java'}</span>
              </div>

              <div className="flex gap-3">
                 <Button 
                    variant="outline" size="sm" 
                    onClick={handleRunTests}
                    disabled={isRunningTests || isSubmitting}
                    className="bg-[#1e1e1e] border-[#505050] hover:bg-[#2a2a2a] hover:text-white text-gray-300 transition-colors"
                 >
                    {isRunningTests ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Run Tests
                 </Button>
              </div>
           </div>

           <div className="flex-1 overflow-hidden relative bg-[#1e1e1e] code-editor-wrapper">
              <Editor
                 height="100%"
                 language={activeLanguage === 'cpp' ? 'cpp' : activeLanguage}
                 value={userCode}
                 theme="vs-dark"
                 onChange={handleCodeChange}
                 options={{
                    minimap: { enabled: false },
                    fontSize: 15,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    lineHeight: 1.6,
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                    suggestOnTriggerCharacters: true,
                    acceptSuggestionOnEnter: "on",
                    tabSize: 4,
                    wordWrap: "on"
                 }}
              />
           </div>

           <div className="h-64 bg-[#181818] border-t border-[#333] p-0 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-6 border-b border-[#333]">
                 <button className="text-gray-100 text-sm font-medium border-b-2 border-green-500 pb-2 -mb-2 transform translate-y-[1px]">Test Results</button>
                 <button className="text-gray-500 hover:text-gray-300 text-sm font-medium pb-2 -mb-2 transition-colors">Console Output</button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                 {!testResults[activeChallengeIndex] && !isRunningTests && (
                   <div className="flex items-center gap-3 text-gray-400 mb-4 bg-black/30 p-3 rounded-lg border border-white/5">
                      <Code className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Click "Run Tests" to evaluate your solution against the examples.</span>
                   </div>
                 )}
                 {isRunningTests && (
                   <div className="flex items-center justify-center p-6 text-gray-400">
                     <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-3" />
                     Evaluating sequence...
                   </div>
                 )}
                 
                 {testResults[activeChallengeIndex] && !isRunningTests && (
                   <div className="space-y-3">
                       {testResults[activeChallengeIndex].error ? (
                          <div className="bg-red-950/40 border border-red-900/50 p-3 rounded text-sm text-red-400 font-mono whitespace-pre-wrap">
                             {testResults[activeChallengeIndex].error}
                          </div>
                       ) : testResults[activeChallengeIndex].map((res, i) => (
                          <div key={i} className={"bg-black/40 border " + (res.passed ? 'border-green-900/30' : 'border-red-900/40') + " p-3 rounded text-sm"}>
                            <div className={"flex items-center gap-2 mb-2 font-semibold " + (res.passed ? 'text-green-400' : 'text-red-400')}>
                               {res.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} 
                               Example {i + 1} - {res.passed ? "Passed" : "Failed"}
                            </div>
                            <div className="font-mono text-xs text-gray-300 flex flex-col gap-1">
                               <div><span className="text-gray-500">Input: </span> {res.input}</div>
                               <div><span className="text-gray-500">Output: </span> {res.actualOutput}</div>
                               {!res.passed && <div><span className="text-gray-500">Expected: </span> {res.expectedOutput}</div>}
                               {res.error && <div className="text-red-400 mt-1">{res.error}</div>}
                            </div>
                         </div>
                       ))}
                   </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
