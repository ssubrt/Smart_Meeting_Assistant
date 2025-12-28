import { StreamClient } from "@stream-io/node-sdk";
import { NextRequest, NextResponse } from "next/server";

// Server-side only - access env vars directly in API routes
const apiKey = process.env.STREAM_API_KEY || "";
const apiSecret = process.env.STREAM_SECRET_KEY  || "";

export async function POST(request: NextRequest) {

    try{

    const { userId } = await request.json();

    if(!apiKey || !apiSecret){
        return Response.json({
            error: "API key or secret is missing"
        },{status:500})
       
    }

    const serverClient = new StreamClient(apiKey,apiSecret);

    const newUser = {
        id: userId,
        role: "admin",
        name: userId.toString()
    };

    await serverClient.upsertUsers([newUser]);
    
    const now = Math.floor(Date.now() / 1000);
    const validity = 24 * 60 * 60; // 24 hours in seconds

    const token = serverClient.generateUserToken({
        user_id: userId,
        validity_in_seconds: validity,
        issued_at: now - 60, // 1 minute clock skew allowance
    });

    return Response.json({
        token
    })

    }

    catch(error : unknown ){
        console.log("Token generation error: ",error);
        return Response.json(
            {error: "Falied To Gererate Token"},
            {status: 500}
        );
    }
}