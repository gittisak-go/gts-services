import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  getLineChannelSecret,
} from "@/lib/line-webhook";
import { replyMessage } from "@/lib/line-messaging";
import { LineMessagingAgent } from "@/lib/line-agent-messaging";
import type { LineWebhookRequest, LineWebhookEvent } from "@/types/line";

/**
 * LINE Webhook endpoint with signature validation
 * Equivalent to @fastapi_line_webhook_security
 *
 * This endpoint:
 * 1. Strictly validates the X-Line-Signature header
 * 2. Processes LINE webhook events
 * 3. Uses LineMessagingAgent to interpret user intent
 * 4. Generates and sends Flex Message responses
 */

export async function POST(request: NextRequest) {
  try {
    // Step 1: Get raw request body for signature verification
    const bodyText = await request.text();

    // Step 2: Get X-Line-Signature header
    const signature = request.headers.get("X-Line-Signature");

    if (!signature) {
      console.error("Missing X-Line-Signature header");
      return NextResponse.json(
        { error: "Missing X-Line-Signature header" },
        { status: 400 }
      );
    }

    // Step 3: Verify signature
    const channelSecret = getLineChannelSecret();
    const isValid = verifyLineSignature(signature, bodyText, channelSecret);

    if (!isValid) {
      console.error("Invalid LINE signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    console.log("✓ Signature verified successfully");

    // Step 4: Parse webhook body
    const body: LineWebhookRequest = JSON.parse(bodyText);

    // Step 5: Process events
    const events = body.events || [];

    for (const event of events) {
      await processEvent(event);
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error processing LINE webhook:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Process individual webhook event
 */
async function processEvent(event: LineWebhookEvent): Promise<void> {
  console.log(`Processing event type: ${event.type}`);

  try {
    switch (event.type) {
      case "message":
        await handleMessageEvent(event);
        break;

      case "follow":
        await handleFollowEvent(event);
        break;

      case "unfollow":
        await handleUnfollowEvent(event);
        break;

      case "join":
        await handleJoinEvent(event);
        break;

      case "leave":
        await handleLeaveEvent(event);
        break;

      case "postback":
        await handlePostbackEvent(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${event.type} event:`, error);
    throw error;
  }
}

/**
 * Handle message event using LineMessagingAgent
 */
async function handleMessageEvent(event: LineWebhookEvent): Promise<void> {
  if (!event.message || !event.source.userId || !event.replyToken) {
    console.log("Skipping message event: missing required fields");
    return;
  }

  // Only handle text messages
  if (event.message.type !== "text") {
    console.log(`Skipping non-text message: ${event.message.type}`);
    return;
  }

  // Create messaging agent
  const agent = new LineMessagingAgent(
    event.source.userId,
    `conv_${event.timestamp}`
  );

  // Process message and generate response
  const flexMessage = await agent.processMessage(event.message);

  // Send reply
  await replyMessage(event.replyToken, [flexMessage]);

  console.log(`Reply sent to user ${event.source.userId}`);
}

/**
 * Handle follow event (user adds bot as friend)
 */
async function handleFollowEvent(event: LineWebhookEvent): Promise<void> {
  if (!event.source.userId || !event.replyToken) {
    return;
  }

  const welcomeMessage = {
    type: "flex",
    altText: "Welcome! Thank you for adding us as a friend.",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Welcome! 🎉",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "text",
            text: "Thank you for adding us as a friend! We're here to help you manage your bookings.",
            wrap: true,
            margin: "md",
            color: "#666666",
            size: "sm",
          },
          {
            type: "text",
            text: "Type 'help' to see what I can do for you.",
            wrap: true,
            margin: "md",
            color: "#666666",
            size: "sm",
          },
        ],
      },
    },
  };

  await replyMessage(event.replyToken, [welcomeMessage]);

  console.log(`Welcome message sent to user ${event.source.userId}`);
}

/**
 * Handle unfollow event (user blocks or removes bot)
 */
async function handleUnfollowEvent(event: LineWebhookEvent): Promise<void> {
  console.log(`User ${event.source.userId} unfollowed the bot`);
  // Clean up user data if needed
}

/**
 * Handle join event (bot joins a group/room)
 */
async function handleJoinEvent(event: LineWebhookEvent): Promise<void> {
  if (!event.replyToken) {
    return;
  }

  const greetingMessage = {
    type: "text",
    text: "Hello! Thank you for inviting me to this group. Type 'help' to see what I can do.",
  };

  await replyMessage(event.replyToken, [greetingMessage]);

  console.log(
    `Bot joined group ${event.source.groupId || event.source.roomId}`
  );
}

/**
 * Handle leave event (bot leaves a group/room)
 */
async function handleLeaveEvent(event: LineWebhookEvent): Promise<void> {
  console.log(
    `Bot left group ${event.source.groupId || event.source.roomId}`
  );
}

/**
 * Handle postback event (user interacts with button)
 */
async function handlePostbackEvent(event: LineWebhookEvent): Promise<void> {
  console.log(`Postback event from user ${event.source.userId}`);
  // Handle button actions
}

// GET method for webhook verification (LINE webhook setup)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "LINE Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
