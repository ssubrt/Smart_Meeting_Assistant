import React from "react"
import { apiKey, ChatUser } from "./helper"
import {  useStreamClients } from "@/hooks/use-stream-clients"
import { StreamVideo } from "@stream-io/video-react-sdk";
import { Chat } from "stream-chat-react";



export default function StreamProvider({children,user,token}:{
    children: React.ReactNode,
    user: ChatUser,
    token: string
}){

    const {videoClient,chatClient} = useStreamClients({apiKey,user,token});

    if(!videoClient || !chatClient){
        return (
            <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900
            via-gray-800 to-gray-900" >
                <p className="text-white text-xl font-semibold mt-6" >Connecting...</p>
            </div>
        )
    }

    return (
        <StreamVideo client={videoClient}>
            <Chat client={chatClient} >
                {children}
            </Chat>
        </StreamVideo>
    )
}