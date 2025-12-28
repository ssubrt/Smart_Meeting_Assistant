
// Client-side only - uses NEXT_PUBLIC_ prefix
export const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

export type ChatUser = {
  id: string;
  name?: string;
  image?: string;
  [key: string]: unknown;
};


export interface StreamClientParams {
    apiKey : string;
    user: ChatUser;
    token: string;
}

export interface userStateResponse{
    id: string;
    name?: string;
    [key: string]: unknown;
}

export interface MeetingRoomProps{
  callId: string;
  onLeave: () => void;
  userId: string;
}

export interface Transcript {
  text: string;
  speaker: string;
  timestamp: string;
  noteType?: string;
}