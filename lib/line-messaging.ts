import { getLineChannelAccessToken } from "./line-webhook";
import type { FlexMessage } from "@/types/line";

const LINE_API_BASE_URL = "https://api.line.me/v2/bot";

/**
 * Send reply message to LINE user
 */
export async function replyMessage(
  replyToken: string,
  messages: any[]
): Promise<void> {
  const accessToken = getLineChannelAccessToken();

  const response = await fetch(`${LINE_API_BASE_URL}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send reply message: ${error}`);
  }
}

/**
 * Send push message to LINE user
 */
export async function pushMessage(
  userId: string,
  messages: any[]
): Promise<void> {
  const accessToken = getLineChannelAccessToken();

  const response = await fetch(`${LINE_API_BASE_URL}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      to: userId,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send push message: ${error}`);
  }
}

/**
 * Get LINE user profile
 */
export async function getLineProfile(userId: string): Promise<any> {
  const accessToken = getLineChannelAccessToken();

  const response = await fetch(`${LINE_API_BASE_URL}/profile/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user profile: ${error}`);
  }

  return response.json();
}

/**
 * Create a simple Flex Message for order shipped notification
 */
export function createOrderShippedFlexMessage(
  orderId: string,
  trackingNumber: string
): FlexMessage {
  return {
    type: "flex",
    altText: `Order ${orderId} has been shipped!`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🚚 Order Shipped",
            weight: "bold",
            size: "xl",
            color: "#1DB446",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "Order ID:",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: orderId,
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 2,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "Tracking #:",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: trackingNumber,
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 2,
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "uri",
              label: "Track Package",
              uri: `https://tracking.example.com/${trackingNumber}`,
            },
          },
        ],
      },
    },
  };
}
