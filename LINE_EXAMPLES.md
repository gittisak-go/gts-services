# LINE MCP Agents - Example Usage Guide

This guide provides practical examples of how to use the LINE MCP agents in your application.

## Quick Start

### 1. Configure Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in your LINE credentials:

```env
NEXT_PUBLIC_LIFF_ID=1234567890-abcdefgh
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Set Up LINE Webhook

1. Deploy your application to a public URL (e.g., Vercel)
2. Go to [LINE Developers Console](https://developers.line.biz/)
3. Navigate to your channel → Messaging API
4. Set Webhook URL: `https://your-domain.com/api/line/webhook`
5. Enable "Use webhook"
6. Click "Verify" to test the connection

## Example 1: Handling User Messages

When a user sends a message to your LINE bot, the webhook automatically processes it:

```typescript
// This happens automatically at /api/line/webhook

// User sends: "I want to book"
// → LineMessagingAgent interprets intent: "booking"
// → Generates Flex Message with booking options
// → Sends reply to user
```

### Test Message Processing

Send these messages to your LINE bot to test different intents:

- **Booking**: "I want to book", "reserve", "จอง"
- **Status**: "check status", "สถานะ"
- **Cancel**: "cancel booking", "ยกเลิก"
- **Help**: "help", "ช่วย"

## Example 2: Sending Proactive Notifications

### Order Shipped Notification

```bash
curl -X POST https://your-domain.com/api/line/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "type": "order_shipped",
    "data": {
      "orderId": "ORD-12345",
      "trackingNumber": "TH987654321"
    }
  }'
```

### Booking Reminder

```bash
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
```

### Custom Notification

```bash
curl -X POST https://your-domain.com/api/line/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "type": "custom",
    "data": {
      "textFallback": "You have a new message",
      "flexMessage": {
        "type": "flex",
        "altText": "Custom Message",
        "contents": {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "Hello from Custom Notification!",
                "weight": "bold",
                "size": "xl"
              }
            ]
          }
        }
      }
    }
  }'
```

## Example 3: LIFF Authentication

### Client-Side (React Component)

```typescript
// components/LiffAuth.tsx
import { useEffect, useState } from 'react';
import { useLiff } from '@/hooks/useLiff';

export function LiffAuth() {
  const { liff, isLoggedIn, loading } = useLiff();
  const [authContext, setAuthContext] = useState(null);

  useEffect(() => {
    if (isLoggedIn && liff) {
      verifyAuth();
    }
  }, [isLoggedIn, liff]);

  const verifyAuth = async () => {
    const idToken = liff.getIDToken();
    
    const response = await fetch('/api/line/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify',
        idToken: idToken
      })
    });

    const data = await response.json();
    setAuthContext(data);
  };

  if (loading) return <div>Loading...</div>;
  if (!isLoggedIn) return <div>Please log in</div>;

  return (
    <div>
      <h2>Welcome, {authContext?.profile?.displayName}!</h2>
      <p>Role: {authContext?.role}</p>
    </div>
  );
}
```

### Server-Side Verification

```typescript
// app/api/protected-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createLiffAuthAgent } from '@/lib/line-agent-liff-auth';

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  // Verify and get auth context
  const agent = createLiffAuthAgent();
  const authContext = await agent.verifyIdToken(idToken);

  // Check if user has required role
  if (!agent.hasRole('admin')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Proceed with protected operation
  return NextResponse.json({ success: true });
}
```

## Example 4: CRM Lead Qualification Workflow

### Initialize Lead from LINE Mini App

```typescript
// app/api/lead/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createLineDurableCrmFlowAgent } from '@/lib/line-durable-crm-flow';

export async function POST(request: NextRequest) {
  const { userId, companyName, employees, budget } = await request.json();

  // Initialize CRM workflow
  const response = await fetch('https://your-domain.com/api/line/crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      action: 'initialize',
      data: {
        source: 'line_mini_app',
        campaign: 'november_2025'
      }
    })
  });

  const result = await response.json();
  
  // User receives Step 1 notification via LINE
  
  return NextResponse.json(result);
}
```

### Complete Step 1 (User submits form)

```typescript
// app/api/lead/step1/route.ts
export async function POST(request: NextRequest) {
  const { leadId, userId, companyName, employees, budget } = await request.json();

  // Advance to Step 2
  const response = await fetch('https://your-domain.com/api/line/crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      action: 'advance_step2',
      leadId: leadId,
      data: {
        companyName: companyName,
        employees: employees,
        budget: budget
      }
    })
  });

  const result = await response.json();
  
  // User receives Step 2 notification via LINE
  
  return NextResponse.json(result);
}
```

### Complete Step 2 and Get Qualification Result

```typescript
// app/api/lead/step2/route.ts
export async function POST(request: NextRequest) {
  const { leadId, userId, goals, challenges, timeline } = await request.json();

  // Advance to Step 3 (final)
  const response = await fetch('https://your-domain.com/api/line/crm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userId,
      action: 'advance_step3',
      leadId: leadId,
      data: {
        goals: goals,
        challenges: challenges,
        timeline: timeline
      }
    })
  });

  const result = await response.json();
  
  // User receives qualification result (qualified/rejected) via LINE
  
  return NextResponse.json(result);
}
```

### Get Lead Status

```bash
curl -X GET "https://your-domain.com/api/line/crm?userId=U1234567890abcdef&leadId=lead_1234567890"
```

## Example 5: Custom Messaging Agent Usage

### Create Your Own Agent

```typescript
// lib/custom-agent.ts
import { LineMessagingAgent } from '@/lib/line-agent-messaging';
import type { LineMessage, FlexMessage } from '@/types/line';

export class CustomSupportAgent extends LineMessagingAgent {
  async processMessage(message: LineMessage): Promise<FlexMessage> {
    // Add custom logic
    const intent = await this.interpretIntent(message);
    
    if (intent.intent === 'urgent') {
      return this.createUrgentSupportMessage();
    }
    
    // Fall back to base implementation
    return super.processMessage(message);
  }

  private createUrgentSupportMessage(): FlexMessage {
    return {
      type: 'flex',
      altText: 'Urgent Support Request',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🚨 Urgent Support',
              weight: 'bold',
              size: 'xl',
              color: '#ffffff'
            }
          ],
          paddingAll: '20px'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'We\'ve received your urgent request. A support agent will contact you within 15 minutes.',
              wrap: true,
              margin: 'md'
            }
          ]
        },
        styles: {
          header: {
            backgroundColor: '#FF0000'
          }
        }
      }
    };
  }
}
```

## Example 6: Scheduled Notifications with Cron

### Set Up Vercel Cron Job

```typescript
// app/api/cron/daily-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createLineToolUseAgent } from '@/lib/line-agent-tool-use';

export async function GET(request: NextRequest) {
  // Verify this is a cron request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch users with bookings tomorrow
  const { supabase } = await import('@/lib/supabase');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, users!inner(line_id)')
    .eq('date', tomorrow.toISOString().split('T')[0]);

  // Send reminders
  for (const booking of bookings || []) {
    const agent = createLineToolUseAgent(booking.users.line_id);
    await agent.sendBookingReminder(
      booking.id,
      booking.date,
      booking.time || '09:00'
    );
  }

  return NextResponse.json({ 
    success: true, 
    remindersSent: bookings?.length || 0 
  });
}
```

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

## Example 7: Testing Locally

### Test Webhook Locally with ngrok

```bash
# 1. Start your development server
npm run dev

# 2. In another terminal, start ngrok
ngrok http 3000

# 3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# 4. Update LINE webhook URL to: https://abc123.ngrok.io/api/line/webhook
# 5. Send messages from LINE to test
```

### Test API Endpoints Locally

```bash
# Test notification endpoint
curl -X POST http://localhost:3000/api/line/notify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "U1234567890abcdef",
    "type": "status_update",
    "data": {
      "status": "Test",
      "message": "Testing locally"
    }
  }'

# Test auth endpoint
curl -X GET http://localhost:3000/api/line/auth

# Test CRM endpoint
curl -X GET http://localhost:3000/api/line/crm
```

## Troubleshooting

### Webhook Returns 403 (Invalid Signature)

- Verify `LINE_CHANNEL_SECRET` is correct
- Ensure you're using the raw request body for signature verification
- Check that the webhook URL is HTTPS (required by LINE)

### Notifications Not Sending

- Verify `LINE_CHANNEL_ACCESS_TOKEN` is correct
- Check if the token has expired (generate a new one if needed)
- Ensure the userId is correct and the user has added your bot as a friend

### LIFF Not Working

- Verify `NEXT_PUBLIC_LIFF_ID` is correct
- Check that the LIFF endpoint URL matches your deployment URL
- Ensure you're opening the app through the LINE app (not a browser)

### CRM Workflow Not Advancing

- Check the lead database table exists
- Verify the leadId is correct
- Check server logs for error messages

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Logging**: Log important events for debugging
3. **Testing**: Test each agent individually before integration
4. **Security**: Never expose environment variables in client code
5. **Performance**: Use background jobs for heavy processing
6. **User Experience**: Provide clear error messages in Flex Messages

## Next Steps

- Integrate with your existing booking system
- Add more custom intents to the messaging agent
- Implement role-based access control
- Add analytics and tracking
- Set up monitoring and alerts
- Create custom Flex Message templates

## Support

For issues or questions:
- Check the [LINE_MCP_AGENTS.md](./LINE_MCP_AGENTS.md) documentation
- Review [LINE Messaging API docs](https://developers.line.biz/en/docs/messaging-api/)
- Check the server logs for error messages
