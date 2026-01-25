"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    LiveKitRoom,
    useParticipants,
    useTracks,
    VideoTrack,
    AudioTrack,
    ControlBar,
    RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { Badge } from "./ui/badge";
import { Loader2, User, Bot } from "lucide-react";

export default function InterviewSession({ room, username }) {
    const [token, setToken] = useState("");
    const router = useRouter();

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

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onDisconnected={() => router.push("/interview")}
            data-lk-theme="default"
            className="rounded-xl overflow-hidden shadow-2xl border border-border bg-black"
            style={{ height: "70vh" }}
        >
            <InterviewLayout />
        </LiveKitRoom>
    );
}

function InterviewLayout() {
    // This hook fetches only Camera tracks, which automatically filters out the "voice only" agent.
    const trackRefs = useTracks([Track.Source.Camera]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 relative group">
            {/* Global Audio Renderer: Ensures you hear everyone in the room, 
                including the voice-only agent who doesn't have a video track. */}
            <RoomAudioRenderer />

            <div className={`flex-1 grid gap-4 p-4 lg:p-6 transition-all duration-700 ${trackRefs.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                {trackRefs.map((trackRef) => (
                    <div key={`${trackRef.participant.identity}-${trackRef.source}`}
                        className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl h-full">

                        {/* High-performance video rendering */}
                        <VideoTrack
                            trackRef={trackRef}
                            className="h-full w-full object-cover"
                        />

                        {/* Custom Overlay Labels */}
                        <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-white/10 text-white text-[10px] uppercase tracking-widest py-1 px-3 flex gap-2 items-center">
                                {trackRef.participant.isLocal ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                                <span className="font-bold">{trackRef.participant.isLocal ? "Candidate" : "Interviewer"}</span>
                            </Badge>
                        </div>
                    </div>
                ))}

                {/* Visual Placeholder if only 1 person (you) is visible */}
                {trackRefs.length === 1 && (
                    <div className="hidden md:flex flex-col items-center justify-center rounded-2xl border border-white/5 border-dashed bg-zinc-900/50 text-muted-foreground gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm font-medium italic">Interviewer is initializing...</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-white">
                <ControlBar
                    variation="minimal"
                    controls={{ microphone: true, camera: true, chat: false, screenShare: false, leave: true, settings: false }}
                    className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl"
                />
            </div>
        </div>
    );
}