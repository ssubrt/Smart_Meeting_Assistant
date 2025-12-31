import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    // Generate unique meeting ID (shorter, URL-friendly)
    const meetingId = randomUUID().split('-')[0] // Use first segment for shorter ID
    
    // Create meeting in database
    const meeting = await prisma.meeting.create({
      data: {
        meetingId: meetingId,
        hostId: session.user.id,
        status: "active",
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      meeting: {
        id: meeting.meetingId,
        hostId: meeting.hostId,
        hostName: meeting.host.username || meeting.host.email,
        createdAt: meeting.createdAt,
        url: `${process.env.NEXTAUTH_URL}/meeting/${meeting.meetingId}`
      }
    }, { status: 201 })

  } catch (error) {
    console.error("Meeting creation error:", error)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
