import { StreamClientParams } from "@/components/helper";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import React from "react";
import { StreamChat } from "stream-chat";



export function useStreamClients({apiKey,user,token}:StreamClientParams) {

    const [videoClient,setVideoClient] = React.useState<StreamVideoClient | null>(null);
    const [chatClient,setChatClient] = React.useState<StreamChat | null>(null);

    React.useEffect(() =>{
        if(!apiKey || !user || !token) return;

        let isMounted = true;
        let videoClientInstance: StreamVideoClient | null = null;
        let chatClientInstance: StreamChat | null = null;

        const initializeClients = async () => {

            try{

                const tokenProvider = () => Promise.resolve(token);

                // Use getOrCreateInstance to avoid creating multiple instances
                const myVideoClient = StreamVideoClient.getOrCreateInstance({
                    apiKey,
                    user,
                    tokenProvider
                });
                videoClientInstance = myVideoClient;

                const myChatClient = StreamChat.getInstance(apiKey);
                chatClientInstance = myChatClient;

                // Only connect if not already connected
                if(myChatClient.userID !== user.id){
                    await myChatClient.connectUser(user, tokenProvider);
                }

                if(isMounted){
                    setVideoClient(myVideoClient);
                    setChatClient(myChatClient);
                }
            }
            catch(error : unknown){
                console.log("Stream Client Initialization Error: ",error);

            }
        };

        initializeClients();

        return () => {
          isMounted = false;
          // Don't disconnect singleton instances on unmount
          // They should persist across component remounts
          if (videoClient) {
            videoClient.disconnectUser().catch(console.error);
          }
          if (chatClient) {
            chatClient.disconnectUser().catch(console.error);
          }
        };

    }, [apiKey, user, token]);

    return {videoClient,chatClient};
}