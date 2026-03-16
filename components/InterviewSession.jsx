"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    LiveKitRoom,
    useParticipants,
    useTracks,
    VideoTrack,
    AudioTrack,
    ControlBar,
    RoomAudioRenderer,
    useTranscriptions,
    useLocalParticipant,
    useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Badge } from "./ui/badge";
import { Loader2, User, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { saveMockInterviewResult } from "@/actions/mock-interview";
import { toast } from "sonner";

export default function InterviewSession({ room, username, behavioralMetrics, onComplete }) {
    const [token, setToken] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSessionEnd = async (transcript) => {
        if (isSaving) return;

        if (!transcript || transcript.length === 0) {
            console.warn("Session ended with empty transcript. Redirecting without saving.");
            toast.error("Low audio detected. No feedback generated.");
            router.push("/interview");
            return;
        }

        setIsSaving(true);
        console.log("Generating analysis...");

        // Pre-serialize to ensure no complex client proxies are passed to the server action
        // We use a custom replacer to avoid any potential circular references in complex nested objects
        const cleanTranscript = JSON.parse(JSON.stringify(transcript || []));

        let rawMetrics = behavioralMetrics || { confidence: 0, eyeContact: 0, posture: 0 };
        // Ensure metrics only contains plain numbers/strings to avoid serialization issues
        const cleanMetrics = {
            confidence: Number(rawMetrics.confidence) || 0,
            eyeContact: Number(rawMetrics.eyeContact) || 0,
            posture: Number(rawMetrics.posture) || 0
        };

        try {
            const result = await saveMockInterviewResult({
                roomName: room,
                behavioralMetrics: cleanMetrics,
                transcript: cleanTranscript
            });
            console.log("Save complete. ID:", result._id);
            toast.success("AI Feedback generated!");
            
            if (onComplete) {
                onComplete(result);
            } else {
                router.push("/interview");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Analysis failed.");
            if (onComplete) {
                onComplete(null, error);
            } else {
                router.push("/interview");
            }
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(
                    `/api/livekit?room=${room}&username=${username}`
                );
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error("Token fetch error:", e);
            }
        })();
    }, [room, username]);

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-[70vh] bg-zinc-950/50 rounded-xl border border-border">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-medium italic">Establishing secure connection...</p>
            </div>
        );
    }

    if (isSaving) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-[70vh] bg-zinc-950/80 backdrop-blur-md rounded-xl border border-primary/20 z-[100]">
                <div className="text-center space-y-4 animate-in zoom-in-95 duration-500">
                    <div className="relative w-24 h-24 mx-auto">
                        <Loader2 className="h-24 w-24 animate-spin text-primary" strokeWidth={1} />
                        <Sparkles className="h-10 w-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Analyzing Performance
                        </h2>
                        <div className="flex flex-col gap-1 items-center">
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                                Generating detailed behavioral and technical feedback...
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                                Gemini 2.5 Flash processing transcript
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={() => {
                console.log("Room disconnected unexpectedly.");
            }}
            data-lk-theme="default"
            className="rounded-xl overflow-hidden shadow-2xl border border-border bg-black"
            style={{ height: "70vh" }}
        >
            <InterviewLayout onSessionEnd={handleSessionEnd} />
        </LiveKitRoom>
    );
}

function InterviewLayout({ onSessionEnd }) {
    const trackRefs = useTracks([Track.Source.Camera]);
    const transcriptions = useTranscriptions();
    const [transcript, setTranscript] = useState([]);
    const transcriptRef = useRef([]);
    const [seconds, setSeconds] = useState(0);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const room = useRoomContext();
    const hasSavedRef = useRef(false);
    const saveTriggerRef = useRef(onSessionEnd);

    // Keep refs in sync
    useEffect(() => {
        transcriptRef.current = transcript;
        saveTriggerRef.current = onSessionEnd;
    }, [transcript, onSessionEnd]);

    const triggerEnd = async (finalTranscript) => {
        if (hasSavedRef.current) return;
        hasSavedRef.current = true;

        console.log("Triggering session end sequence");

        if (room.state !== "disconnected") {
            try { room.disconnect(); } catch (e) { }
        }

        if (saveTriggerRef.current) {
            await saveTriggerRef.current(finalTranscript || transcriptRef.current);
        }
    };

    // Auto-save on UNMOUNT (catches any disconnection/tab close/refresh)
    useEffect(() => {
        return () => {
            // We can't await here, but we can fire and forget the save if needed
            if (!hasSavedRef.current && transcriptRef.current.length > 0) {
                console.log("Unmount detected. Final emergency save.");
                if (saveTriggerRef.current) {
                    saveTriggerRef.current(transcriptRef.current);
                }
            }
        };
    }, []);

    // Listen for completion signal from AI Agent Tool
    useEffect(() => {
        const handleData = (payload, participant) => {
            try {
                const decoder = new TextDecoder();
                const data = JSON.parse(decoder.decode(payload));

                if (data.type === "INTERVIEW_COMPLETE") {
                    console.log("Received AI Agent completion signal via tool");
                    triggerEnd(transcriptRef.current);
                }
            } catch (e) {
                // Ignore non-json or malformed data
            }
        };

        room.on("dataReceived", handleData);
        return () => room.off("dataReceived", handleData);
    }, [room]);

    // Keep ref in sync
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // Session Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev >= 300) {
                    setIsTimeUp(true);
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-wrapup logic
    useEffect(() => {
        if (isTimeUp) {
            const lastEntry = transcript[transcript.length - 1];
            if (lastEntry?.role === "interviewer") {
                const timeout = setTimeout(() => triggerEnd(transcriptRef.current), 5000);
                return () => clearTimeout(timeout);
            } else {
                const timeout = setTimeout(() => triggerEnd(transcriptRef.current), 10000);
                return () => clearTimeout(timeout);
            }
        }
    }, [isTimeUp, transcript]);

    // Capture transcriptions
    useEffect(() => {
        if (transcriptions && transcriptions.length > 0) {
            const latest = transcriptions[transcriptions.length - 1];
            if (latest.text && latest.participant) {
                const role = latest.participant.isLocal ? "candidate" : "interviewer";
                setTranscript(prev => {
                    // Check if content already exists
                    const exists = prev.some(e => e.content === latest.text && e.role === role);
                    if (exists) return prev;

                    // CRITICAL: Only store plain data. Including the participant object directly
                    // can cause SecurityError/JSON serialization issues.
                    return [...prev, {
                        role,
                        content: latest.text,
                        timestamp: new Date().toISOString()
                    }];
                });
            }
        }
    }, [transcriptions]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 relative group">
            <RoomAudioRenderer />

            <div className="absolute top-6 right-6 z-20 flex flex-col items-end gap-2">
                <Badge variant={isTimeUp ? "destructive" : "outline"} className="bg-black/40 backdrop-blur-md px-3 py-1 font-mono text-xs border-white/10">
                    <span className={`w-2 h-2 rounded-full mr-2 ${isTimeUp ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                    SESSION TIME: {formatTime(seconds)} / 5:00
                </Badge>
            </div>

            <div className={`flex-1 grid gap-4 p-4 lg:p-6 transition-all duration-700 ${trackRefs.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                {trackRefs.map((trackRef) => (
                    <div key={`${trackRef.participant.identity}-${trackRef.source}`}
                        className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl h-full">

                        <VideoTrack
                            trackRef={trackRef}
                            className="h-full w-full object-cover"
                        />

                        <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[10px] uppercase tracking-widest py-1 px-3 flex gap-2 items-center">
                                {trackRef.participant.isLocal ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                                <span className="font-bold">{trackRef.participant.isLocal ? "Candidate" : "Interviewer"}</span>
                            </Badge>
                        </div>
                    </div>
                ))}

                {trackRefs.length === 1 && (
                    <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed bg-zinc-900/50 text-muted-foreground gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm font-medium italic font-mono tracking-tighter uppercase opacity-50">Calibrating AI Presence...</p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-white flex items-center gap-4">
                <ControlBar
                    variation="minimal"
                    controls={{ microphone: true, camera: true, chat: false, screenShare: false, leave: false, settings: false }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl"
                />
                <Button
                    variant="destructive"
                    className="rounded-full px-6 shadow-2xl font-bold uppercase tracking-wider text-xs h-10 ring-2 ring-red-500/20 hover:scale-105 transition-all"
                    onClick={() => triggerEnd()}
                >
                    End Interview
                </Button>
            </div>
        </div>
    );
}