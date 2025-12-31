import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    const { id } = await params
    const meetingId = id

    // Check if meeting exists
    const meeting = await prisma.meeting.findUnique({
      where: { meetingId },
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

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found", exists: false },
        { status: 404 }
      )
    }

    // Check if meeting is still active
    if (meeting.status === "ended") {
      return NextResponse.json(
        { 
          error: "This meeting has ended", 
          exists: true,
          status: "ended" 
        },
        { status: 410 }
      )
    }

    return NextResponse.json({
      exists: true,
      meeting: {
        id: meeting.meetingId,
        hostId: meeting.hostId,
        hostName: meeting.host.username || meeting.host.email,
        status: meeting.status,
        startedAt: meeting.startedAt,
        isHost: meeting.hostId === session.user.id,
      }
    })

  } catch (error) {
    console.error("Meeting validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate meeting" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    const { id } = await params
    const meetingId = id

    const meeting = await prisma.meeting.findUnique({
      where: { meetingId }
    })

    if (!meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      )
    }

    // Only host can end meeting
    if (status === "ended" && meeting.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can end the meeting" },
        { status: 403 }
      )
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { meetingId },
      data: {
        status,
        ...(status === "ended" && { endedAt: new Date() })
      }
    })

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting
    })

  } catch (error) {
    console.error("Meeting update error:", error)
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    )
  }
}
