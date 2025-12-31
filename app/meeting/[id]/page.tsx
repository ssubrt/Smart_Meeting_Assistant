"use client"

import { userStateResponse } from '@/components/helper';
import MeetingRoom from '@/components/meeting-room';
import StreamProvider from '@/components/stream-provider';
import { StreamTheme } from '@stream-io/video-react-sdk';
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react';
import React from 'react'

const Meetingpage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const callId = params.id as string;

    const [user, setUser] = React.useState<userStateResponse | null>(null);
    const [token, setToken] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [meetingInfo, setMeetingInfo] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);

    // Check authentication
    React.useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/signin");
        }
    }, [status, router]);

    // Validate meeting exists
    React.useEffect(() => {
        if (!session) return;

        fetch(`/api/meetings/${callId}`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.exists) {
                    setError("Meeting not found");
                } else if (data.status === "ended") {
                    setError("This meeting has ended");
                } else {
                    setMeetingInfo(data.meeting);
                }
            })
            .catch(() => {
                setError("Failed to validate meeting");
            });
    }, [callId, session]);

    // Setup user from session
    React.useEffect(() => {
        if (!session?.user) return;

        setUser({
            id: session.user.id,
            name: session.user.username || session.user.name || session.user.email || "User",
            image: session.user.image,
        });
    }, [session]);

    // Fetch Stream token
    React.useEffect(() => {
        if (!user) return;

        fetch("/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: user.id })
        })
            .then((response) => {
                if (!response.ok) {
                    setError("Failed to fetch token");
                }
                return response.json();
            })
            .then((data) => {
                if (data.token) setToken(data.token);
                else setError("Token not found in response");
            })
            .catch((error: unknown) => {
                setError("Error fetching token: " + error);
            });
    }, [user]);

    function handleLeave() {
        router.push("/");
    }

    function copyMeetingLink() {
        const url = `${window.location.origin}/meeting/${callId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg max-w-md">
                    <p className="text-red-500 font-bold text-lg mb-2">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 w-full"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!token || !user || !meetingInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg">Connecting to meeting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Meeting Link Share Banner */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">Meeting ID:</span>
                        <code className="bg-gray-700 px-3 py-1 rounded text-blue-400 font-mono text-sm">
                            {callId}
                        </code>
                    </div>
                    <button
                        onClick={copyMeetingLink}
                        className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                    >
                        {copied ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="pt-12">
                <StreamProvider user={user} token={token}>
                    <StreamTheme>
                        <MeetingRoom callId={callId} onLeave={handleLeave} userId={user.id} />
                    </StreamTheme>
                </StreamProvider>
            </div>
        </div>
    )
}

export default Meetingpage