"use client"


import { CallControls, SpeakerLayout, StreamCall, StreamTheme, useStreamVideoClient, Call } from '@stream-io/video-react-sdk'
import React from 'react'
import { MeetingRoomProps } from './helper';
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { TranscriptPanel } from './TranscriptPanel';

// Suppress screen share cancellation errors globally
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (message.includes('[devices]') && 
        message.includes('Failed to get screen share stream') && 
        message.includes('NotAllowedError')) {
      // User cancelled screen share, ignore this error
      return;
    }
    originalError.apply(console, args);
  };
}

const MeetingRoom = ({callId,onLeave,userId}:MeetingRoomProps) => {

    const client = useStreamVideoClient();
    const [call,setCall] = React.useState<Call | null>(null);
    const [error,setError] = React.useState<string | null>(null);

    const joinedRef = React.useRef<boolean>(false);
    const leftRef = React.useRef<boolean>(false);

    const callType = "default";

    React.useEffect(() => {
        if(!client || joinedRef.current) return;
        joinedRef.current = true;

        const init = async () => {

            try{
                const myCall = client.call(callType,callId);
                await myCall.getOrCreate({
                    data: {
                        // created_by : userId,
                        members : [ {user_id: userId,role: "call_member"}]
                    },
                });

                await myCall.join();
                await myCall.startClosedCaptions({ language: "en" });

                myCall.on("call.session_ended",() => {
                    console.log("Call ended");
                    onLeave?.();

                });
                setCall(myCall);
            }
            catch(error: unknown){
                setError("Error joining call: " + error);
                console.log("Error joining call: ",error);
            }
        };

        init();

        return () => {
            if(call && !leftRef.current){
                leftRef.current = true;
                call.stopClosedCaptions().catch(() => {});
                call.leave().catch(() => {});
            }
        }

    },[client,callId,userId,call,onLeave]);
    
    if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Error: {error}</p>
      </div>
    );
    }

    if (!call)
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <div className="animate-spin h-16 w-16 border-t-4 border-blue-500 mx-auto rounded-full" />
          <p className="mt-4 text-lg">Loading meeting…</p>
        </div>
      </div>
    );

    const handleLeaveClick = async () => {
      if(leftRef.current){
        onLeave?.();
        return;
      }

      leftRef.current = true;
      try{
        if(call){
          await call.stopClosedCaptions().catch(() => {});
          await call.leave().catch(() => {});
        }
      } catch(error : unknown) {
        console.log("Error leaving call: ",error);
      } finally {
        onLeave?.();
      }
    }

  return (
       <StreamTheme>
      <StreamCall call={call}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 py-6 h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 h-full">
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden shadow-2xl">
                  <SpeakerLayout />
                </div>

                <div className="flex justify-center pb-4">
                  <div className="bg-gray-800 rounded-full px-8 py-4 border border-gray-700 shadow-xl">
                    <CallControls onLeave={handleLeaveClick} />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                <TranscriptPanel />
              </div>
            </div>
          </div>
        </div>
      </StreamCall>
    </StreamTheme>
  )
}

export default MeetingRoom