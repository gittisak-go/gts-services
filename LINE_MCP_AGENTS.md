# LINE MCP (Model Context Protocol) Agents

This document describes the LINE-focused MCP agents implemented in this project. These agents provide intelligent, context-aware handling of LINE messaging, authentication, workflows, and notifications.

## Overview

The implementation includes five main agent components:

1. **@line_agent_messaging** - Message interpretation and Flex Message generation
2. **@line_agent_liff_auth** - LIFF authentication and user context management
3. **@line_durable_crm_flow** - Durable CRM workflows with persistent state
4. **@line_agent_tool_use** - Proactive notifications using LINE Messaging API
5. **@fastapi_line_webhook_security** - Secure webhook endpoint with signature validation

## 1. LINE Messaging Agent (@line_agent_messaging)

**Purpose**: Interpret user intent from LINE messages and generate personalized Flex Message responses.

**Location**: `/lib/line-agent-messaging.ts`

**Features**:
- Natural language intent classification (booking, status inquiry, help, etc.)
- Context-aware message processing
- Automatic Flex Message generation based on intent
- Session and conversation tracking

**Usage**:

```typescript
import { LineMessagingAgent } from "@/lib/line-agent-messaging";

// Create agent instance
const agent = new LineMessagingAgent(userId, conversationId);

// Process incoming message
const message = { type: "text", text: "I want to book", id: "msg123" };
const flexMessage = await agent.processMessage(message);

// Get agent context
const context = agent.getContext();
```

**Supported Intents**:
- `booking` - Create or cancel bookings
- `status_inquiry` - Check booking status
- `help` - Get help and available commands
- `general` - General conversation

**Webhook Integration**:
The agent is automatically used in the webhook endpoint at `/api/line/webhook`.

## 2. LIFF Authentication Agent (@line_agent_liff_auth)

**Purpose**: Verify ID tokens, manage user authentication context, and inject user roles.

**Location**: `/lib/line-agent-liff-auth.ts`

**Features**:
- ID token verification
- Access token validation with LINE API
- User role management with hierarchy
- Context injection for downstream agents
- Integration with user database for role lookup

**Usage**:

```typescript
import { createLiffAuthAgent } from "@/lib/line-agent-liff-auth";

// Create agent instance
const agent = createLiffAuthAgent();

// Verify ID token
const authContext = await agent.verifyIdToken(idToken);

// Inject role into context
const enhancedContext = agent.injectRoleIntoContext({
  requestId: "req-123",
  timestamp: new Date().toISOString(),
});

// Check user role
const isAdmin = agent.hasRole("admin");
```

**API Endpoint**: `/api/line/auth`

**Role Hierarchy**:
- `user` (level 1) - Basic user
- `moderator` (level 2) - Can perform moderation actions
- `admin` (level 3) - Full access

**Example API Call**:

```bash
curl -X POST https://your-domain.com/api/line/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "verify",
    "idToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

## 3. Durable CRM Flow Agent (@line_durable_crm_flow)

**Purpose**: Manage multi-step lead qualification workflows with persistent state.

**Location**: `/lib/line-durable-crm-flow.ts`

**Features**:
- 3-step lead qualification process
- Persistent workflow state
- Proactive notifications at each step
- Qualification decision logic
- Integration with LINE Mini App

**Workflow Steps**:

### Step 1: Initial Contact and Information Gathering
- Collects: company name, number of employees, budget range
- Sends welcome Flex Message
- Prompts user to provide information via LIFF

### Step 2: Needs Assessment
- Collects: goals, challenges, timeline
- Sends needs assessment Flex Message
- Gathers detailed requirements

### Step 3: Qualification Decision
- Evaluates collected data
- Makes qualification decision
- Sends appropriate outcome message (qualified/rejected)
- For qualified leads: offers to schedule a call

**Usage**:

```typescript
import { createLineDurableCrmFlowAgent } from "@/lib/line-durable-crm-flow";

// Initialize workflow
const agent = createLineDurableCrmFlowAgent(userId);
const lead = await agent.initializeLeadQualification({
  source: "line_mini_app",
  campaign: "summer_2025",
});

// Advance to step 2
await agent.executeStep2({
  companyName: "Example Corp",
  employees: 50,
  budget: 50000,
});

// Advance to step 3 (final)
await agent.executeStep3({
  goals: "increase efficiency",
  challenges: "manual processes",
  timeline: "3 months",
});

// Get lead status
const status = agent.getLeadStatus();
```

**API Endpoint**: `/api/line/crm`

**Example API Calls**:

```bash
# Initialize workflow
curl -X POST https://your-domain.com/api/line/crm \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "action": "initialize",
    "data": {
      "source": "line_mini_app",
      "campaign": "summer_2025"
    }
  }'

# Advance to step 2
curl -X POST https://your-domain.com/api/line/crm \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "action": "advance_step2",
    "leadId": "lead_1234567890",
    "data": {
      "companyName": "Example Corp",
      "employees": 50,
      "budget": 50000
    }
  }'

# Get lead status
curl -X GET "https://your-domain.com/api/line/crm?userId=U1234567890abcdef&leadId=lead_1234567890"
```

## 4. Tool Use Agent (@line_agent_tool_use)

**Purpose**: Send proactive notifications using LINE Messaging API tools.

**Location**: `/lib/line-agent-tool-use.ts`

**Features**:
- Order shipped notifications with tracking
- Booking reminders
- Status updates
- Custom Flex Message notifications
- External API integration with notifications
- Notification scheduling (requires job queue integration)

**Usage**:

```typescript
import { createLineToolUseAgent } from "@/lib/line-agent-tool-use";

const agent = createLineToolUseAgent(userId);

// Send order shipped notification
await agent.sendOrderShippedNotification("ORD-123", "TRK-456");

// Send booking reminder
await agent.sendBookingReminder("BK-789", "2025-11-20", "14:00");

// Send status update
await agent.sendStatusUpdate("Processing Complete", "Your request has been completed.");

// Send custom notification
await agent.sendCustomNotification(flexMessage, "Fallback text");
```

**API Endpoint**: `/api/line/notify`

**Example API Calls**:

```bash
# Send order shipped notification
curl -X POST https://your-domain.com/api/line/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "type": "order_shipped",
    "data": {
      "orderId": "ORD-123",
      "trackingNumber": "TRK-456"
    }
  }'

# Send booking reminder
curl -X POST https://your-domain.com/api/line/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "type": "booking_reminder",
    "data": {
      "bookingId": "BK-789",
      "date": "2025-11-20",
      "time": "14:00"
    }
  }'

# Send test notification
curl -X GET "https://your-domain.com/api/line/notify?userId=U1234567890abcdef"
```

## 5. Webhook Security Gateway (@fastapi_line_webhook_security)

**Purpose**: Secure webhook endpoint with LINE signature validation.

**Location**: `/app/api/line/webhook/route.ts`

**Features**:
- **Strict X-Line-Signature validation** using HMAC-SHA256
- Event type routing (message, follow, unfollow, join, leave, postback)
- Integration with LineMessagingAgent for message processing
- Automatic Flex Message responses
- Welcome messages for new followers
- Error handling and logging

**Security Implementation**:

```typescript
// 1. Extract signature from header
const signature = request.headers.get("X-Line-Signature");

// 2. Verify signature against raw body
const isValid = verifyLineSignature(signature, bodyText, channelSecret);

// 3. Reject if invalid
if (!isValid) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
}
```

**Supported Events**:
- `message` - User sends a message
- `follow` - User adds bot as friend
- `unfollow` - User blocks or removes bot
- `join` - Bot joins a group/room
- `leave` - Bot leaves a group/room
- `postback` - User interacts with button

**Webhook URL**: `https://your-domain.com/api/line/webhook`

**LINE Configuration**:

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your channel
3. Go to "Messaging API" tab
4. Set Webhook URL: `https://your-domain.com/api/line/webhook`
5. Enable "Use webhook"
6. Verify webhook (LINE will send a test event)

**Testing Webhook**:

```bash
# Test GET endpoint
curl https://your-domain.com/api/line/webhook

# Simulate LINE webhook (requires valid signature)
curl -X POST https://your-domain.com/api/line/webhook \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: <valid_signature>" \
  -d '{
    "destination": "Uxxxxxxxx",
    "events": [
      {
        "type": "message",
        "message": {
          "type": "text",
          "id": "123456789",
          "text": "hello"
        },
        "timestamp": 1234567890,
        "source": {
          "type": "user",
          "userId": "U1234567890abcdef"
        },
        "replyToken": "replytoken123"
      }
    ]
  }'
```

## Environment Configuration

Required environment variables (see `.env.local.example`):

```env
# LINE LIFF Configuration
NEXT_PUBLIC_LIFF_ID=your-liff-id-here

# LINE Channel Configuration
LINE_CHANNEL_SECRET=your-channel-secret-here
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token-here

# Supabase Configuration (for user data)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

## Getting LINE Credentials

1. **LIFF ID**:
   - Go to LINE Developers Console → Your Channel → LIFF
   - Create a new LIFF app or use existing one
   - Copy the LIFF ID

2. **Channel Secret**:
   - Go to LINE Developers Console → Your Channel → Basic settings
   - Copy "Channel secret"

3. **Channel Access Token**:
   - Go to LINE Developers Console → Your Channel → Messaging API
   - Click "Issue" to generate a channel access token
   - Copy the token (long-lived)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         LINE Platform                        │
├─────────────────────────────────────────────────────────────┤
│  User Messages  │  LIFF Auth  │  Mini App  │  Notifications │
└────────┬──────────────┬──────────────┬──────────────┬───────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  /api/line/webhook  │  /api/line/auth  │  /api/line/notify  │
│  (Signature Check)  │  (ID Token)      │  (Push Messages)   │
└────────┬──────────────┬──────────────┬──────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Layer                             │
├─────────────────────────────────────────────────────────────┤
│  LineMessagingAgent │  LiffAuthAgent  │  LineToolUseAgent  │
│  (Intent & Flex)    │  (Auth Context) │  (Notifications)   │
│                     │                 │                     │
│  LineDurableCrmFlowAgent (Workflows)                        │
└────────┬──────────────┬──────────────┬──────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data & Services Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Supabase    │  LINE Messaging API  │  External APIs        │
│  (Database)  │  (Push/Reply)        │  (Integrations)       │
└─────────────────────────────────────────────────────────────┘
```

## Best Practices

1. **Security**:
   - Always verify X-Line-Signature header
   - Never expose LINE_CHANNEL_SECRET
   - Use environment variables for all credentials
   - Validate all user inputs

2. **Error Handling**:
   - Log errors but don't expose internal details to users
   - Return appropriate HTTP status codes
   - Send user-friendly error messages via LINE

3. **Performance**:
   - Process webhook events asynchronously
   - Use job queues for scheduled tasks
   - Cache frequently accessed data

4. **Context Management**:
   - Maintain conversation context per user
   - Use session IDs for tracking
   - Store workflow state persistently

5. **Testing**:
   - Test webhook signature validation
   - Mock LINE API calls in tests
   - Verify Flex Message structure

## Production Considerations

1. **Temporal Integration**: For production-grade durable workflows, integrate with [Temporal](https://temporal.io/) or similar workflow engine.

2. **Job Queue**: Use Redis + Bull or similar for notification scheduling and async processing.

3. **Database**: Create proper tables for:
   - CRM leads (`crm_leads`)
   - Conversation history (`conversations`)
   - User roles (`users.role`)

4. **Monitoring**: Add logging, metrics, and alerting for:
   - Webhook failures
   - API errors
   - Workflow progress
   - Notification delivery

5. **Rate Limiting**: Implement rate limiting to prevent abuse and stay within LINE API quotas.

## References

- [LINE Messaging API Documentation](https://developers.line.biz/en/docs/messaging-api/)
- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [LINE Flex Message Simulator](https://developers.line.biz/flex-simulator/)
- [LINE Webhook Documentation](https://developers.line.biz/en/docs/messaging-api/receiving-messages/)
