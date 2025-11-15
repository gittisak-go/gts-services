import type {
  LineMessage,
  FlexMessage,
  MessageIntent,
  AgentContext,
} from "@/types/line";

/**
 * LINE Agent for interpreting user messages and generating responses
 * This agent handles the Model Context Protocol (MCP) for LINE messaging
 */
export class LineMessagingAgent {
  private context: AgentContext;

  constructor(userId: string, conversationId: string) {
    this.context = {
      userId,
      conversationId,
      sessionId: `session_${Date.now()}`,
      metadata: {},
    };
  }

  /**
   * Interpret user intent from message
   */
  async interpretIntent(message: LineMessage): Promise<MessageIntent> {
    // Simple intent classification - in production, integrate with NLP service
    const text = message.text?.toLowerCase() || "";

    if (
      text.includes("book") ||
      text.includes("reserve") ||
      text.includes("จอง")
    ) {
      return {
        intent: "booking",
        confidence: 0.9,
        entities: { action: "create" },
      };
    }

    if (
      text.includes("cancel") ||
      text.includes("ยกเลิก") ||
      text.includes("delete")
    ) {
      return {
        intent: "booking",
        confidence: 0.85,
        entities: { action: "cancel" },
      };
    }

    if (
      text.includes("status") ||
      text.includes("check") ||
      text.includes("สถานะ")
    ) {
      return {
        intent: "status_inquiry",
        confidence: 0.8,
        entities: {},
      };
    }

    if (text.includes("help") || text.includes("ช่วย")) {
      return {
        intent: "help",
        confidence: 0.95,
        entities: {},
      };
    }

    return {
      intent: "general",
      confidence: 0.5,
      entities: {},
    };
  }

  /**
   * Generate personalized Flex Message based on intent
   */
  async generateFlexMessage(intent: MessageIntent): Promise<FlexMessage> {
    switch (intent.intent) {
      case "booking":
        return this.createBookingFlexMessage(intent);
      case "status_inquiry":
        return this.createStatusFlexMessage();
      case "help":
        return this.createHelpFlexMessage();
      default:
        return this.createGeneralFlexMessage();
    }
  }

  /**
   * Create booking-related Flex Message
   */
  private createBookingFlexMessage(intent: MessageIntent): FlexMessage {
    const action = intent.entities.action;

    return {
      type: "flex",
      altText: "Booking Options",
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: action === "cancel" ? "Cancel Booking" : "Create Booking",
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
              text:
                action === "cancel"
                  ? "Select a booking to cancel:"
                  : "Choose a booking option:",
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
                  type: "button",
                  style: "primary",
                  action: {
                    type: "uri",
                    label: action === "cancel" ? "View Bookings" : "New Booking",
                    uri: "https://liff.line.me/" + (process.env.NEXT_PUBLIC_LIFF_ID || ""),
                  },
                },
              ],
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
  }

  /**
   * Create status inquiry Flex Message
   */
  private createStatusFlexMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "Your Status",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "📊 Your Status",
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
                      text: "Active Bookings:",
                      color: "#aaaaaa",
                      size: "sm",
                      flex: 1,
                    },
                    {
                      type: "text",
                      text: "0",
                      wrap: true,
                      color: "#666666",
                      size: "sm",
                      flex: 0,
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
              style: "link",
              height: "sm",
              action: {
                type: "uri",
                label: "View Details",
                uri: "https://liff.line.me/" + (process.env.NEXT_PUBLIC_LIFF_ID || ""),
              },
            },
          ],
        },
      },
    };
  }

  /**
   * Create help Flex Message
   */
  private createHelpFlexMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "Help & Commands",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "💡 Help & Commands",
              weight: "bold",
              size: "xl",
              color: "#1DB446",
            },
            {
              type: "text",
              text: "Here are some commands you can use:",
              wrap: true,
              margin: "md",
              color: "#666666",
              size: "sm",
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
                  type: "text",
                  text: "• 'book' - Create a new booking",
                  size: "sm",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "• 'status' - Check your bookings",
                  size: "sm",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "• 'cancel' - Cancel a booking",
                  size: "sm",
                  wrap: true,
                },
              ],
            },
          ],
        },
      },
    };
  }

  /**
   * Create general response Flex Message
   */
  private createGeneralFlexMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "Response",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "👋 Hello!",
              weight: "bold",
              size: "xl",
              color: "#1DB446",
            },
            {
              type: "text",
              text: "I'm here to help you manage your bookings. Type 'help' to see available commands.",
              wrap: true,
              margin: "md",
              color: "#666666",
              size: "sm",
            },
          ],
        },
      },
    };
  }

  /**
   * Process message and generate response
   */
  async processMessage(message: LineMessage): Promise<FlexMessage> {
    const intent = await this.interpretIntent(message);
    return this.generateFlexMessage(intent);
  }

  /**
   * Update context metadata
   */
  updateContext(metadata: Record<string, any>): void {
    this.context.metadata = { ...this.context.metadata, ...metadata };
  }

  /**
   * Get current context
   */
  getContext(): AgentContext {
    return this.context;
  }
}
