import crypto from "crypto";

/**
 * Verify LINE webhook signature
 * @param signature - X-Line-Signature header value
 * @param body - Raw request body
 * @param channelSecret - LINE Channel Secret
 * @returns true if signature is valid
 */
export function verifyLineSignature(
  signature: string,
  body: string,
  channelSecret: string
): boolean {
  if (!signature || !body || !channelSecret) {
    return false;
  }

  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");

  return signature === hash;
}

/**
 * Get LINE Channel Secret from environment
 */
export function getLineChannelSecret(): string {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    throw new Error("LINE_CHANNEL_SECRET is not configured");
  }
  return secret;
}

/**
 * Get LINE Channel Access Token from environment
 */
export function getLineChannelAccessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  }
  return token;
}
