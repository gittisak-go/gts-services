import { NextRequest, NextResponse } from "next/server";
import { createLineDurableCrmFlowAgent } from "@/lib/line-durable-crm-flow";

/**
 * LINE CRM Workflow API endpoint
 * Demonstrates @line_durable_crm_flow capabilities
 *
 * POST /api/line/crm - Initialize or advance CRM workflow
 * GET /api/line/crm?userId=xxx&leadId=xxx - Get lead status
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, leadId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Create CRM flow agent
    const agent = createLineDurableCrmFlowAgent(userId);

    switch (action) {
      case "initialize":
        // Start new lead qualification workflow
        const lead = await agent.initializeLeadQualification(data || {});
        return NextResponse.json({
          success: true,
          lead,
          message: "Lead qualification workflow initialized",
        });

      case "advance_step2":
        // Advance to step 2
        if (!leadId) {
          return NextResponse.json(
            { error: "leadId is required for advancing workflow" },
            { status: 400 }
          );
        }
        await agent.loadLead(leadId);
        await agent.executeStep2(data || {});
        return NextResponse.json({
          success: true,
          message: "Advanced to step 2",
        });

      case "advance_step3":
        // Advance to step 3
        if (!leadId) {
          return NextResponse.json(
            { error: "leadId is required for advancing workflow" },
            { status: 400 }
          );
        }
        await agent.loadLead(leadId);
        await agent.executeStep3(data || {});
        return NextResponse.json({
          success: true,
          message: "Advanced to step 3 (final)",
        });

      case "get_status":
        // Get current lead status
        if (!leadId) {
          return NextResponse.json(
            { error: "leadId is required for getting status" },
            { status: 400 }
          );
        }
        const leadStatus = await agent.loadLead(leadId);
        return NextResponse.json({
          success: true,
          lead: leadStatus,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Error in CRM workflow:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process CRM workflow" },
      { status: 500 }
    );
  }
}

// GET method for retrieving lead status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const leadId = searchParams.get("leadId");

  if (!userId && !leadId) {
    return NextResponse.json(
      {
        message: "LINE CRM Workflow API",
        usage: {
          endpoint: "/api/line/crm",
          methods: {
            POST: {
              description: "Initialize or advance CRM workflow",
              body: {
                userId: "string (required)",
                action:
                  "initialize | advance_step2 | advance_step3 | get_status",
                leadId: "string (required for advance/get_status)",
                data: "object (optional, step-specific data)",
              },
            },
            GET: {
              description: "Get lead status",
              params: {
                userId: "string",
                leadId: "string",
              },
            },
          },
        },
        workflow: {
          description:
            "3-step lead qualification process initiated via LINE Mini App",
          steps: [
            {
              step: 1,
              name: "Initial Contact and Information Gathering",
              fields: ["companyName", "employees", "budget"],
            },
            {
              step: 2,
              name: "Needs Assessment",
              fields: ["goals", "challenges", "timeline"],
            },
            {
              step: 3,
              name: "Qualification Decision",
              outcomes: ["qualified", "rejected"],
            },
          ],
        },
        examples: {
          initialize: {
            userId: "U1234567890abcdef",
            action: "initialize",
            data: {
              source: "line_mini_app",
              campaign: "summer_2025",
            },
          },
          advance_step2: {
            userId: "U1234567890abcdef",
            action: "advance_step2",
            leadId: "lead_1234567890",
            data: {
              companyName: "Example Corp",
              employees: 50,
              budget: 50000,
            },
          },
        },
      },
      { status: 200 }
    );
  }

  try {
    if (userId && leadId) {
      const agent = createLineDurableCrmFlowAgent(userId);
      const lead = await agent.loadLead(leadId);

      if (!lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        lead,
      });
    }

    return NextResponse.json(
      { error: "Both userId and leadId are required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error retrieving lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve lead" },
      { status: 500 }
    );
  }
}
