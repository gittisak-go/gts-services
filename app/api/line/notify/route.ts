import { NextRequest, NextResponse } from "next/server";
import { createLineToolUseAgent } from "@/lib/line-agent-tool-use";

/**
 * LINE Notification API endpoint
 * Demonstrates @line_agent_tool_use capabilities
 *
 * POST /api/line/notify - Send proactive notifications
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create tool-use agent
    const agent = createLineToolUseAgent(userId);

    // Handle different notification types
    switch (type) {
      case "order_shipped":
        if (!data.orderId || !data.trackingNumber) {
          return NextResponse.json(
            { error: "orderId and trackingNumber are required" },
            { status: 400 }
          );
        }
        await agent.sendOrderShippedNotification(
          data.orderId,
          data.trackingNumber
        );
        break;

      case "booking_reminder":
        if (!data.bookingId || !data.date || !data.time) {
          return NextResponse.json(
            { error: "bookingId, date, and time are required" },
            { status: 400 }
          );
        }
        await agent.sendBookingReminder(
          data.bookingId,
          data.date,
          data.time
        );
        break;

      case "status_update":
        if (!data.status || !data.message) {
          return NextResponse.json(
            { error: "status and message are required" },
            { status: 400 }
          );
        }
        await agent.sendStatusUpdate(data.status, data.message);
        break;

      case "custom":
        if (!data.flexMessage) {
          return NextResponse.json(
            { error: "flexMessage is required" },
            { status: 400 }
          );
        }
        await agent.sendCustomNotification(
          data.flexMessage,
          data.textFallback
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to user ${userId}`,
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notification" },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        message: "LINE Notification API",
        usage: {
          endpoint: "/api/line/notify",
          method: "POST",
          body: {
            userId: "string (required)",
            type: "order_shipped | booking_reminder | status_update | custom",
            data: "object (varies by type)",
          },
          examples: {
            order_shipped: {
              userId: "U1234567890abcdef",
              type: "order_shipped",
              data: {
                orderId: "ORD-123",
                trackingNumber: "TRK-456",
              },
            },
            booking_reminder: {
              userId: "U1234567890abcdef",
              type: "booking_reminder",
              data: {
                bookingId: "BK-789",
                date: "2025-11-20",
                time: "14:00",
              },
            },
          },
        },
      },
      { status: 200 }
    );
  }

  // Test notification
  try {
    const agent = createLineToolUseAgent(userId);
    await agent.sendStatusUpdate(
      "Test Notification",
      "This is a test notification from the LINE Tool Use Agent."
    );

    return NextResponse.json({
      success: true,
      message: `Test notification sent to user ${userId}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send test notification" },
      { status: 500 }
    );
  }
}
