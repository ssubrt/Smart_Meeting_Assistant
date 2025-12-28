"use client";
import { useRouter } from "next/navigation";
import React from "react";


export default function Home() {

  const [userName,setUsername] = React.useState<string>("");
  const router = useRouter();
  const meetingId = process.env.NEXT_PUBLIC_CALL_ID!
   
  const handleJoin = () => {
    const name = userName.trim() === "" ? "Guest" : userName;
    router.push(`/meeting/${meetingId}?name=${encodeURIComponent(name)}`);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br
     from-gray-900 via-gray-800 to-gray-900 text-white ">
      <div className="p-8 bg-gray-800/60 rounded-2xl border border-gray-700 w-80 shadow-2xl" >

      <h2 className="text-xl font-semibold mb-4 text-center" >Enter your name</h2>
      <input placeholder="Enter your name"
      className="px-4 py-3 w-full rounded-lg bg-gray-700/80 border border-gray-400 text-white"
      value={userName}
      onChange={(e) => setUsername(e.target.value)}
      
      />

      <button 
      onClick={handleJoin}
      
      className="mt-5 w-full py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg font-medium" >
        Join Meeting
      </button>

      </div>
    </div>
  );
}
