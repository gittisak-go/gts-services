import type { CrmLead, WorkflowStep } from "@/types/line";
import { createLineToolUseAgent } from "./line-agent-tool-use";

/**
 * Durable CRM Flow Agent
 * Manages multi-step lead qualification workflows with persistent state
 * In production, integrate with Temporal or similar workflow engine
 */
export class LineDurableCrmFlowAgent {
  private userId: string;
  private lead: CrmLead | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize a 3-step lead qualification process
   */
  async initializeLeadQualification(
    leadData: Record<string, any>
  ): Promise<CrmLead> {
    const lead: CrmLead = {
      id: `lead_${Date.now()}`,
      userId: this.userId,
      status: "new",
      step: 1,
      data: leadData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store lead in database
    await this.saveLead(lead);

    this.lead = lead;

    // Start step 1
    await this.executeStep1();

    return lead;
  }

  /**
   * Execute Step 1: Initial Contact and Information Gathering
   */
  private async executeStep1(): Promise<void> {
    console.log(`Executing Step 1 for lead ${this.lead?.id}`);

    const toolAgent = createLineToolUseAgent(this.userId);

    // Send initial contact message
    await toolAgent.sendCustomNotification(
      {
        type: "flex",
        altText: "Welcome! Let's get started with your qualification.",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "Step 1: Welcome! 👋",
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
                text: "Thank you for your interest! We'd like to learn more about your needs.",
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
                    type: "text",
                    text: "Please provide the following information:",
                    size: "sm",
                    wrap: true,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: "• Your company name",
                    size: "sm",
                  },
                  {
                    type: "text",
                    text: "• Number of employees",
                    size: "sm",
                  },
                  {
                    type: "text",
                    text: "• Your budget range",
                    size: "sm",
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
                  label: "Provide Information",
                  uri:
                    "https://liff.line.me/" +
                    (process.env.NEXT_PUBLIC_LIFF_ID || "") +
                    "?lead=" +
                    this.lead?.id,
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
      }
    );

    // Update lead status
    await this.updateLeadStep(1, "completed");
  }

  /**
   * Execute Step 2: Needs Assessment
   */
  async executeStep2(step1Data: Record<string, any>): Promise<void> {
    if (!this.lead) {
      throw new Error("Lead not initialized");
    }

    console.log(`Executing Step 2 for lead ${this.lead.id}`);

    // Update lead data with step 1 results
    this.lead.data = { ...this.lead.data, ...step1Data };
    await this.saveLead(this.lead);

    const toolAgent = createLineToolUseAgent(this.userId);

    // Send needs assessment message
    await toolAgent.sendCustomNotification(
      {
        type: "flex",
        altText: "Step 2: Needs Assessment",
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "Step 2: Needs Assessment 📋",
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
                text: "Great! Now let's understand your specific needs.",
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
                    type: "text",
                    text: "What are your main goals?",
                    size: "sm",
                    wrap: true,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: "• Increase efficiency",
                    size: "sm",
                  },
                  {
                    type: "text",
                    text: "• Reduce costs",
                    size: "sm",
                  },
                  {
                    type: "text",
                    text: "• Improve customer experience",
                    size: "sm",
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
                  label: "Share Your Goals",
                  uri:
                    "https://liff.line.me/" +
                    (process.env.NEXT_PUBLIC_LIFF_ID || "") +
                    "?lead=" +
                    this.lead.id +
                    "&step=2",
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
      }
    );

    await this.updateLeadStep(2, "completed");
  }

  /**
   * Execute Step 3: Qualification Decision
   */
  async executeStep3(step2Data: Record<string, any>): Promise<void> {
    if (!this.lead) {
      throw new Error("Lead not initialized");
    }

    console.log(`Executing Step 3 for lead ${this.lead.id}`);

    // Update lead data with step 2 results
    this.lead.data = { ...this.lead.data, ...step2Data };
    await this.saveLead(this.lead);

    const toolAgent = createLineToolUseAgent(this.userId);

    // Determine qualification status
    const isQualified = this.determineQualification();

    if (isQualified) {
      this.lead.status = "qualified";

      await toolAgent.sendCustomNotification(
        {
          type: "flex",
          altText: "Congratulations! You're qualified.",
          contents: {
            type: "bubble",
            header: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "Step 3: Qualified! 🎉",
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
                  text: "Congratulations! You meet our qualification criteria.",
                  wrap: true,
                  margin: "md",
                },
                {
                  type: "text",
                  text: "A sales representative will contact you within 24 hours.",
                  wrap: true,
                  margin: "md",
                  color: "#666666",
                  size: "sm",
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
                    label: "Schedule a Call",
                    uri:
                      "https://liff.line.me/" +
                      (process.env.NEXT_PUBLIC_LIFF_ID || "") +
                      "?lead=" +
                      this.lead.id +
                      "&action=schedule",
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
        }
      );
    } else {
      this.lead.status = "rejected";

      await toolAgent.sendCustomNotification(
        {
          type: "flex",
          altText: "Thank you for your interest.",
          contents: {
            type: "bubble",
            body: {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "Thank You 🙏",
                  weight: "bold",
                  size: "xl",
                  color: "#666666",
                },
                {
                  type: "text",
                  text: "Thank you for your interest. At this time, we don't have a suitable match for your needs.",
                  wrap: true,
                  margin: "md",
                  color: "#666666",
                  size: "sm",
                },
              ],
            },
          },
        }
      );
    }

    await this.updateLeadStep(3, "completed");
  }

  /**
   * Determine if lead is qualified based on collected data
   */
  private determineQualification(): boolean {
    if (!this.lead) return false;

    // Simple qualification logic - in production, use more sophisticated rules
    const data = this.lead.data;

    // Check if required fields are present
    if (!data.companyName || !data.employees || !data.budget) {
      return false;
    }

    // Qualify if company has more than 10 employees and reasonable budget
    return data.employees > 10 && data.budget > 10000;
  }

  /**
   * Save lead to database
   */
  private async saveLead(lead: CrmLead): Promise<void> {
    try {
      const { supabase } = await import("@/lib/supabase");

      // In production, create a proper leads table
      // For now, we'll just log it
      console.log("Saving lead:", lead);

      // Example implementation:
      // await supabase.from("crm_leads").upsert({
      //   id: lead.id,
      //   user_id: lead.userId,
      //   status: lead.status,
      //   step: lead.step,
      //   data: lead.data,
      //   updated_at: lead.updatedAt,
      // });
    } catch (error) {
      console.error("Failed to save lead:", error);
      throw error;
    }
  }

  /**
   * Update lead step status
   */
  private async updateLeadStep(
    step: number,
    status: "pending" | "completed" | "failed"
  ): Promise<void> {
    if (!this.lead) return;

    this.lead.step = step;
    this.lead.updatedAt = new Date();

    await this.saveLead(this.lead);
  }

  /**
   * Get lead status
   */
  getLeadStatus(): CrmLead | null {
    return this.lead;
  }

  /**
   * Load existing lead
   */
  async loadLead(leadId: string): Promise<CrmLead | null> {
    try {
      // In production, load from database
      // For now, we'll just return null
      console.log(`Loading lead ${leadId}`);

      // Example implementation:
      // const { supabase } = await import("@/lib/supabase");
      // const { data } = await supabase
      //   .from("crm_leads")
      //   .select("*")
      //   .eq("id", leadId)
      //   .single();
      //
      // if (data) {
      //   this.lead = data;
      //   return data;
      // }

      return null;
    } catch (error) {
      console.error("Failed to load lead:", error);
      return null;
    }
  }
}

/**
 * Create durable CRM flow agent instance
 */
export function createLineDurableCrmFlowAgent(
  userId: string
): LineDurableCrmFlowAgent {
  return new LineDurableCrmFlowAgent(userId);
}
