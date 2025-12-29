import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export interface MilestoneFeedbackParams {
  commitmentTitle: string;
  category: string | null;
  goalHours: number;
  hoursThreshold: number;
  userSynthesis: string;
  recentReflections: string[];
}

/**
 * Generate personalized AI feedback for a milestone synthesis.
 * Uses Google's Gemini Flash model for fast, cost-effective generation.
 */
export async function generateMilestoneFeedback(
  params: MilestoneFeedbackParams,
): Promise<string> {
  const {
    commitmentTitle,
    category,
    goalHours,
    hoursThreshold,
    userSynthesis,
    recentReflections,
  } = params;

  const reflectionsText =
    recentReflections.length > 0
      ? `Here are some of their recent learning reflections:\n${recentReflections.map((r) => `- ${r}`).join("\n")}`
      : "";

  const prompt = `You are a supportive learning coach. A user is tracking their progress toward a ${goalHours}-hour learning commitment in "${commitmentTitle}"${category ? ` (${category})` : ""}.

They just reached the ${hoursThreshold}-hour milestone and wrote this synthesis:

"${userSynthesis}"

${reflectionsText}

Provide brief, personalized feedback (2-3 sentences) that:
1. References specific themes or growth you notice in their journey
2. Offers encouragement for the road ahead
3. Maintains a warm, casual tone matching a "Lazy Lofi" aesthetic

Keep it concise and genuine - no generic platitudes.`;

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt,
    maxRetries: 2,
  });

  return text;
}
