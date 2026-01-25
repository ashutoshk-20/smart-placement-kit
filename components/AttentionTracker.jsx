"use client";

import React, { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Camera, CameraOff, Brain, Smile, Minimize2, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const AttentionTracker = ({ onFeedback }) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const feedbackRef = useRef(onFeedback);
    const [faceLandmarker, setFaceLandmarker] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [history, setHistory] = useState([]);
    const [metrics, setMetrics] = useState({
        eyeContact: 0,
        posture: 0,
        confidence: 0,
        status: "Initializing...",
        lastFeedback: ""
    });

    // Suppression logic for MediaPipe non-error logs that trigger Next.js error overlay
    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            if (typeof args[0] === 'string' && (args[0].includes('INFO:') || args[0].includes('XNNPACK'))) {
                return;
            }
            originalConsoleError.apply(console, args);
        };
        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    // Stability: Keep feedback callback updated but stable for the effect
    useEffect(() => {
        feedbackRef.current = onFeedback;
    }, [onFeedback]);

    useEffect(() => {
        let landmarkerInstance = null;
        async function initMediaPipe() {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                landmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                setFaceLandmarker(landmarkerInstance);
                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to initialize MediaPipe:", error);
                setMetrics(prev => ({ ...prev, status: "Error: MediaPipe Load Failed" }));
            }
        }
        initMediaPipe();
        return () => {
            if (landmarkerInstance) landmarkerInstance.close();
        };
    }, []);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
    };

    const startCamera = async () => {
        try {
            if (streamRef.current) return; // Already running

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, frameRate: 15 }
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(true);
        } catch (error) {
            console.error("Error accessing camera:", error);
            setMetrics(prev => ({ ...prev, status: "Camera Access Denied" }));
        }
    };

    useEffect(() => {
        if (isLoaded && !showSummary) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isLoaded, showSummary]);

    useEffect(() => {
        let animationFrameId;
        let lastHistoryUpdate = 0;
        let lastMetricsUpdate = 0;

        const processVideo = async () => {
            if (faceLandmarker && videoRef.current && videoRef.current.readyState === 4) {
                const startTimeMs = performance.now();

                if (startTimeMs - lastMetricsUpdate > 100) {
                    const results = await faceLandmarker.detectForVideo(videoRef.current, startTimeMs);

                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                        const landmarks = results.faceLandmarks[0];
                        const blendshapes = results.faceBlendshapes[0]?.categories || [];

                        const eyeOpenL = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
                        const eyeOpenR = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;

                        const leftEye = landmarks[33];
                        const rightEye = landmarks[263];
                        const noseTip = landmarks[1];
                        const yawValue = (noseTip.x - (leftEye.x + rightEye.x) / 2) * 100;
                        const yawScore = Math.max(0, 100 - Math.abs(yawValue) * 7);

                        const smileScore = blendshapes.find(b => b.categoryName === 'mouthSmileLeft')?.score || 0;
                        const confidenceScore = Math.min(100, (smileScore * 150) + 60);

                        const newMetrics = {
                            eyeContact: Math.round(100 - (eyeOpenL + eyeOpenR) * 50),
                            posture: Math.round(yawScore),
                            confidence: Math.round(confidenceScore),
                            status: "Tracking active",
                            lastFeedback: yawScore < 70 ? "Try to look at the screen" :
                                smileScore > 0.3 ? "Great smile! You look confident." :
                                    "Maintain steady eye contact"
                        };

                        setMetrics(newMetrics);
                        if (feedbackRef.current) feedbackRef.current(newMetrics);

                        if (startTimeMs - lastHistoryUpdate > 2000) {
                            setHistory(prev => [...prev.slice(-29), newMetrics]);
                            lastHistoryUpdate = startTimeMs;
                        }

                        lastMetricsUpdate = startTimeMs;
                    } else {
                        setMetrics(prev =>
                            prev.status === "Face not detected" ? prev : { ...prev, status: "Face not detected" }
                        );
                    }
                }
            }
            animationFrameId = requestAnimationFrame(processVideo);
        };

        if (isCameraOn && faceLandmarker) {
            processVideo();
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [isCameraOn, faceLandmarker]);

    const getAverages = () => {
        if (history.length === 0) return metrics;
        const sum = history.reduce((acc, curr) => ({
            eyeContact: acc.eyeContact + curr.eyeContact,
            posture: acc.posture + curr.posture,
            confidence: acc.confidence + curr.confidence
        }), { eyeContact: 0, posture: 0, confidence: 0 });

        return {
            eyeContact: Math.round(sum.eyeContact / history.length),
            posture: Math.round(sum.posture / history.length),
            confidence: Math.round(sum.confidence / history.length)
        };
    };

    const averages = getAverages();

    if (showSummary) {
        return (
            <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[100] shadow-2xl border-primary animate-in zoom-in-95 duration-300 bg-background">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6" />
                        Behavioral Feedback Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Eye Contact</p>
                            <p className="text-2xl font-bold text-primary">{averages.eyeContact}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Posture</p>
                            <p className="text-2xl font-bold text-primary">{averages.posture}%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Confidence</p>
                            <p className="text-2xl font-bold text-primary">{averages.confidence}%</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg border-l-4 border-primary">
                            <h4 className="font-semibold text-sm flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4 text-primary" /> Key Observations
                            </h4>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                {averages.eyeContact > 80 ? <li>• Excellent eye contact maintained throughout.</li> : <li>• Try to look more directly at the camera.</li>}
                                {averages.posture > 80 ? <li>• Stable and professional posture observed.</li> : <li>• Avoid excessive head movements or leaning.</li>}
                                {averages.confidence > 70 ? <li>• You appeared confident and engaged.</li> : <li>• Practice speaking with more enthusiasm and a smile.</li>}
                            </ul>
                        </div>
                    </div>

                    <Button className="w-full" onClick={() => setShowSummary(false)}>Close Report</Button>
                </CardContent>
            </Card>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
                <div className="bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border text-[10px] font-medium shadow-sm border-primary/20">
                    Tracking {metrics.confidence}% Confidence
                </div>
                <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-lg border-2 border-primary/20 hover:scale-110 transition-transform"
                    onClick={() => setIsMinimized(false)}
                >
                    <Brain className="h-5 w-5 text-primary" />
                </Button>
            </div>
        );
    }

    return (
        <Card className="fixed bottom-4 right-4 w-72 z-50 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-sm transition-all animate-in slide-in-from-right-10">
            <CardHeader className="p-3 flex flex-row items-center justify-between pb-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Behavioral Coach
                </CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowSummary(true)}>
                        <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
                        <Minimize2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border group">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover mirror"
                        autoPlay
                        playsInline
                        muted
                    />
                    {!isCameraOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            {isLoaded ? <CameraOff className="h-8 w-8 text-muted-foreground" /> : <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                        <Badge variant="outline" className="bg-background/50 text-[10px] backdrop-blur-sm">
                            Real-time AI
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Eye Contact</span>
                            <span className="font-medium">{metrics.eyeContact}%</span>
                        </div>
                        <Progress value={metrics.eyeContact} className="h-1.5" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Body Posture</span>
                            <span className="font-medium">{metrics.posture}%</span>
                        </div>
                        <Progress value={metrics.posture} className="h-1.5" />
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Confidence</span>
                            <span className="font-medium">{metrics.confidence}%</span>
                        </div>
                        <Progress value={metrics.confidence} className="h-1.5" />
                    </div>
                </div>

                <div className="pt-2 border-t border-border">
                    <p className="text-[11px] text-primary leading-tight font-medium flex gap-2 items-center">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {metrics.lastFeedback || metrics.status}
                    </p>
                </div>
            </CardContent>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </Card>
    );
};

export default AttentionTracker;
