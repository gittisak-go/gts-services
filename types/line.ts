// LINE Messaging API Types
export interface LineWebhookEvent {
  type: string;
  message?: LineMessage;
  timestamp: number;
  source: LineSource;
  replyToken?: string;
  mode?: string;
}

export interface LineMessage {
  type: string;
  id: string;
  text?: string;
  [key: string]: any;
}

export interface LineSource {
  type: string;
  userId?: string;
  groupId?: string;
  roomId?: string;
}

export interface LineWebhookRequest {
  destination: string;
  events: LineWebhookEvent[];
}

// LINE Flex Message Types
export interface FlexMessage {
  type: "flex";
  altText: string;
  contents: FlexContainer;
}

export interface FlexContainer {
  type: "bubble" | "carousel";
  header?: FlexBox;
  hero?: FlexComponent;
  body?: FlexBox;
  footer?: FlexBox;
  styles?: FlexBubbleStyles;
}

export interface FlexBox {
  type: "box";
  layout: "horizontal" | "vertical" | "baseline";
  contents: FlexComponent[];
  spacing?: string;
  margin?: string;
  paddingAll?: string;
  [key: string]: any;
}

export interface FlexComponent {
  type: string;
  [key: string]: any;
}

export interface FlexBubbleStyles {
  header?: { backgroundColor?: string };
  body?: { backgroundColor?: string };
  footer?: { backgroundColor?: string };
}

// LINE Profile Type
export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// LIFF Authentication Context
export interface LiffAuthContext {
  idToken: string;
  accessToken: string;
  profile: LineProfile;
  role?: string;
  verified: boolean;
}

// Agent Context Types
export interface AgentContext {
  userId: string;
  conversationId: string;
  sessionId: string;
  metadata: Record<string, any>;
}

export interface MessageIntent {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

// CRM Workflow Types
export interface CrmLead {
  id: string;
  userId: string;
  status: "new" | "qualified" | "contacted" | "converted" | "rejected";
  step: number;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  step: number;
  name: string;
  status: "pending" | "completed" | "failed";
  data?: Record<string, any>;
}
