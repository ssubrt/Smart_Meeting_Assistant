"use client"
import { userStateResponse } from '@/components/helper';
import MeetingRoom from '@/components/meeting-room';
import StreamProvider from '@/components/stream-provider';
import { StreamTheme } from '@stream-io/video-react-sdk';
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import React from 'react'



const Meetingpage = () => {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();

    const callId = params.id as string;
    const name = searchParams.get("name") || "Guest";

    const [user,setUser] = React.useState< userStateResponse | null>(null);
    const [token,setToken] = React.useState<string | null>(null);
    const [error,setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setUser({
            id: name.toLowerCase().replace(/\s+/g,"-"),
            name
        })
    },[name]);

    React.useEffect(() => {

        if(!user) return;

        fetch("/api/token",{
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({userId : user.id})
        })
        .then((response) => {
            if(!response.ok){
                setError("Failed to fetch token");
            }
         return response.json();
        })
        .then((data) => {
            if(data.token) setToken(data.token);
            else setError("Token not found in response");
        })
        .catch((error: unknown) => {
            setError("Error fetching token: " + error);
        });

    },[user]);

    function handleLeave(){
        router.push("/");
    }

    if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-500 font-bold text-lg mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

    if (!token || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Connecting…</p>
        </div>
      </div>
    );
  }


  return (
    <StreamProvider user={user} token={token}>
        <StreamTheme>
          <MeetingRoom callId={callId} onLeave={handleLeave} userId={user.id}  />
        </StreamTheme>
    </StreamProvider>
  )
}

export default Meetingpage