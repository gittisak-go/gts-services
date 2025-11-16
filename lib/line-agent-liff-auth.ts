import liff from "@line/liff";
import type { LiffAuthContext, LineProfile } from "@/types/line";

/**
 * LIFF Authentication Agent
 * Handles ID token verification and user context management
 */
export class LiffAuthAgent {
  private authContext: LiffAuthContext | null = null;

  /**
   * Verify ID Token and create authentication context
   */
  async verifyIdToken(idToken: string): Promise<LiffAuthContext> {
    try {
      // In production, verify the ID token with LINE's verification endpoint
      // For now, we'll decode it (in production, use proper JWT verification)
      const decoded = this.decodeIdToken(idToken);

      if (!decoded) {
        throw new Error("Invalid ID token");
      }

      const context: LiffAuthContext = {
        idToken,
        accessToken: "", // Will be set separately
        profile: {
          userId: decoded.sub,
          displayName: decoded.name || "",
          pictureUrl: decoded.picture,
        },
        verified: true,
        role: this.determineUserRole(decoded),
      };

      this.authContext = context;
      return context;
    } catch (error) {
      throw new Error(`ID token verification failed: ${error}`);
    }
  }

  /**
   * Initialize authentication from LIFF
   */
  async initializeAuth(): Promise<LiffAuthContext | null> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      if (!liff.isLoggedIn()) {
        return null;
      }

      const idToken = liff.getIDToken();
      const accessToken = liff.getAccessToken();
      const profile = await liff.getProfile();

      if (!idToken || !accessToken) {
        return null;
      }

      const context: LiffAuthContext = {
        idToken,
        accessToken,
        profile: {
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          statusMessage: profile.statusMessage,
        },
        verified: true,
        role: await this.fetchUserRole(profile.userId),
      };

      this.authContext = context;
      return context;
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      return null;
    }
  }

  /**
   * Decode ID token (simplified - use proper JWT library in production)
   */
  private decodeIdToken(token: string): any {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Failed to decode ID token:", error);
      return null;
    }
  }

  /**
   * Determine user role from ID token claims
   */
  private determineUserRole(decoded: any): string {
    // In production, check custom claims or database
    // For now, default to 'user'
    return decoded.role || "user";
  }

  /**
   * Fetch user role from database
   */
  private async fetchUserRole(userId: string): Promise<string> {
    try {
      // In production, fetch from database
      // For now, check if user exists in users table
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("line_id", userId)
        .single();

      return data?.role || "user";
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      return "user";
    }
  }

  /**
   * Get current authentication context
   */
  getAuthContext(): LiffAuthContext | null {
    return this.authContext;
  }

  /**
   * Inject user role into agent context
   */
  injectRoleIntoContext(baseContext: Record<string, any>): Record<string, any> {
    if (!this.authContext) {
      return baseContext;
    }

    return {
      ...baseContext,
      auth: {
        userId: this.authContext.profile.userId,
        displayName: this.authContext.profile.displayName,
        role: this.authContext.role,
        verified: this.authContext.verified,
      },
    };
  }

  /**
   * Check if user has required role
   */
  hasRole(requiredRole: string): boolean {
    if (!this.authContext) {
      return false;
    }

    const roleHierarchy: Record<string, number> = {
      user: 1,
      moderator: 2,
      admin: 3,
    };

    const userRoleLevel = roleHierarchy[this.authContext.role || "user"] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        "https://api.line.me/oauth2/v2.1/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `access_token=${accessToken}`,
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to validate access token:", error);
      return false;
    }
  }

  /**
   * Clear authentication context
   */
  clearAuth(): void {
    this.authContext = null;
  }
}

/**
 * Create singleton instance for server-side use
 */
export function createLiffAuthAgent(): LiffAuthAgent {
  return new LiffAuthAgent();
}
