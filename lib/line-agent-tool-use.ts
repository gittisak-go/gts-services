import { pushMessage, createOrderShippedFlexMessage } from "./line-messaging";
import type { FlexMessage } from "@/types/line";

/**
 * LINE Agent with Tool Use capabilities
 * Handles proactive notifications and external API calls
 */
export class LineToolUseAgent {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Send proactive 'Order Shipped' notification
   */
  async sendOrderShippedNotification(
    orderId: string,
    trackingNumber: string
  ): Promise<void> {
    const flexMessage = createOrderShippedFlexMessage(orderId, trackingNumber);

    await pushMessage(this.userId, [flexMessage]);

    console.log(
      `Order shipped notification sent to user ${this.userId} for order ${orderId}`
    );
  }

  /**
   * Send custom notification with Flex Message
   */
  async sendCustomNotification(
    flexMessage: FlexMessage,
    textFallback?: string
  ): Promise<void> {
    const messages: any[] = [flexMessage];

    // Add text fallback if provided
    if (textFallback) {
      messages.unshift({
        type: "text",
        text: textFallback,
      });
    }

    await pushMessage(this.userId, messages);

    console.log(`Custom notification sent to user ${this.userId}`);
  }

  /**
   * Send booking reminder notification
   */
  async sendBookingReminder(
    bookingId: string,
    date: string,
    time: string
  ): Promise<void> {
    const flexMessage: FlexMessage = {
      type: "flex",
      altText: `Reminder: Booking on ${date} at ${time}`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🔔 Booking Reminder",
              weight: "bold",
              size: "xl",
              color: "#ffffff",
            },
          ],
          paddingAll: "20px",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "You have an upcoming booking!",
              wrap: true,
              margin: "md",
            },
            {
              type: "separator",
              margin: "lg",
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
                      text: "Date:",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: date,
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
                      text: "Time:",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: time,
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
                label: "View Details",
                uri:
                  "https://liff.line.me/" +
                  (process.env.NEXT_PUBLIC_LIFF_ID || ""),
              },
            },
          ],
        },
        styles: {
          header: {
            backgroundColor: "#1DB446",
          },
        },
      },
    };

    await pushMessage(this.userId, [flexMessage]);

    console.log(`Booking reminder sent to user ${this.userId} for booking ${bookingId}`);
  }

  /**
   * Send status update notification
   */
  async sendStatusUpdate(status: string, message: string): Promise<void> {
    const flexMessage: FlexMessage = {
      type: "flex",
      altText: `Status Update: ${status}`,
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `📢 ${status}`,
              weight: "bold",
              size: "xl",
              color: "#1DB446",
            },
            {
              type: "text",
              text: message,
              wrap: true,
              margin: "md",
              color: "#666666",
              size: "sm",
            },
          ],
        },
      },
    };

    await pushMessage(this.userId, [flexMessage]);

    console.log(`Status update sent to user ${this.userId}: ${status}`);
  }

  /**
   * Call external API and send result notification
   */
  async callExternalApiAndNotify(
    apiUrl: string,
    payload: any
  ): Promise<void> {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Send success notification
      await this.sendStatusUpdate(
        "API Call Success",
        `External API call completed successfully.`
      );

      return result;
    } catch (error) {
      // Send error notification
      await this.sendStatusUpdate(
        "API Call Failed",
        `External API call failed: ${error}`
      );

      throw error;
    }
  }

  /**
   * Schedule notification (simplified - use proper job queue in production)
   */
  async scheduleNotification(
    flexMessage: FlexMessage,
    scheduleTime: Date
  ): Promise<void> {
    const delay = scheduleTime.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately if scheduled time is in the past
      await pushMessage(this.userId, [flexMessage]);
      return;
    }

    // In production, use a proper job queue like Bull or Temporal
    console.log(
      `Notification scheduled for user ${this.userId} at ${scheduleTime}`
    );

    // For demo purposes, we'll just log it
    // In production, store in database or job queue
  }
}

/**
 * Create tool-use agent instance
 */
export function createLineToolUseAgent(userId: string): LineToolUseAgent {
  return new LineToolUseAgent(userId);
}
