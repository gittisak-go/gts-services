import { NextRequest, NextResponse } from "next/server";
import { createLiffAuthAgent } from "@/lib/line-agent-liff-auth";

/**
 * LINE Authentication API endpoint
 * Demonstrates @line_agent_liff_auth capabilities
 *
 * POST /api/line/auth/verify - Verify ID token and inject user role
 * POST /api/line/auth/validate - Validate access token
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, idToken, accessToken } = body;

    const agent = createLiffAuthAgent();

    switch (action) {
      case "verify":
        // Verify ID token and create auth context
        if (!idToken) {
          return NextResponse.json(
            { error: "idToken is required" },
            { status: 400 }
          );
        }

        const authContext = await agent.verifyIdToken(idToken);

        // Inject user role into context
        const enhancedContext = agent.injectRoleIntoContext({
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          context: enhancedContext,
          profile: authContext.profile,
          role: authContext.role,
          verified: authContext.verified,
        });

      case "validate":
        // Validate access token
        if (!accessToken) {
          return NextResponse.json(
            { error: "accessToken is required" },
            { status: 400 }
          );
        }

        const isValid = await agent.validateAccessToken(accessToken);

        return NextResponse.json({
          success: true,
          valid: isValid,
        });

      case "check_role":
        // Check if user has required role
        if (!idToken) {
          return NextResponse.json(
            { error: "idToken is required" },
            { status: 400 }
          );
        }

        await agent.verifyIdToken(idToken);
        const requiredRole = body.requiredRole || "user";
        const hasRole = agent.hasRole(requiredRole);

        return NextResponse.json({
          success: true,
          hasRole,
          requiredRole,
          userRole: agent.getAuthContext()?.role,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Error in authentication:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}

// GET method for documentation
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "LINE Authentication API",
      usage: {
        endpoint: "/api/line/auth",
        method: "POST",
        actions: {
          verify: {
            description: "Verify ID token and inject user role into context",
            body: {
              action: "verify",
              idToken: "string (required)",
            },
            response: {
              success: true,
              context: {
                timestamp: "ISO string",
                auth: {
                  userId: "string",
                  displayName: "string",
                  role: "string",
                  verified: "boolean",
                },
              },
              profile: {
                userId: "string",
                displayName: "string",
                pictureUrl: "string (optional)",
              },
              role: "string",
              verified: "boolean",
            },
          },
          validate: {
            description: "Validate access token with LINE API",
            body: {
              action: "validate",
              accessToken: "string (required)",
            },
            response: {
              success: true,
              valid: "boolean",
            },
          },
          check_role: {
            description: "Check if user has required role",
            body: {
              action: "check_role",
              idToken: "string (required)",
              requiredRole: "string (optional, default: user)",
            },
            response: {
              success: true,
              hasRole: "boolean",
              requiredRole: "string",
              userRole: "string",
            },
          },
        },
      },
      roleHierarchy: {
        user: 1,
        moderator: 2,
        admin: 3,
      },
      examples: {
        verify: {
          action: "verify",
          idToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        validate: {
          action: "validate",
          accessToken: "your_access_token_here",
        },
        check_role: {
          action: "check_role",
          idToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          requiredRole: "admin",
        },
      },
    },
    { status: 200 }
  );
}
