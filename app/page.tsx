"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleJoinMeeting = () => {
    const meetingId = process.env.NEXT_PUBLIC_CALL_ID!;
    router.push(`/meeting/${meetingId}?name=${encodeURIComponent(session.user.username || session.user.email || "User")}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="p-8 bg-gray-800/60 rounded-2xl border border-gray-700 w-96 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome, {session.user.username || session.user.name}!</h1>
          <p className="text-gray-400 text-sm">{session.user.email}</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleJoinMeeting}
            className="w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            Join Meeting
          </button>

          <button 
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="w-full py-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
