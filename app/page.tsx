"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleCreateMeeting = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/meetings/create", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create meeting");
        setLoading(false);
        return;
      }

      // Redirect to the new meeting
      router.push(`/meeting/${data.meeting.id}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/meetings/${meetingId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Meeting not found");
        setLoading(false);
        return;
      }

      // Meeting exists, join it
      router.push(`/meeting/${meetingId.trim()}`);
    } catch (err) {
      setError("Failed to validate meeting. Please try again.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-8 bg-gray-800/60 rounded-2xl border border-gray-700 w-96 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {session.user.username || session.user.name}!
          </h1>
          <p className="text-gray-400 text-sm">{session.user.email}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {!showJoinModal ? (
          <div className="space-y-3">
            <button
              onClick={handleCreateMeeting}
              disabled={loading}
              className="w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {loading ? "Creating..." : "Create New Meeting"}
            </button>

            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full py-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Join Existing Meeting
            </button>

            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="w-full py-3 cursor-pointer bg-gray-700/50 hover:bg-gray-600/50 rounded-lg font-medium transition text-gray-300"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting ID
              </label>
              <input
                type="text"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinMeeting()}
                placeholder="Enter meeting ID"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleJoinMeeting}
              disabled={loading}
              className="w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition"
            >
              {loading ? "Joining..." : "Join Meeting"}
            </button>

            <button
              onClick={() => {
                setShowJoinModal(false);
                setMeetingId("");
                setError("");
              }}
              className="w-full py-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
