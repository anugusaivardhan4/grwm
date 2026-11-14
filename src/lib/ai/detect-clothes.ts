import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { CATEGORIES, SEASONS } from "@/lib/wardrobe-options";

const categoryValues = CATEGORIES.map((c) => c.value) as [string, ...string[]];
const seasonValues = SEASONS.map((s) => s.value) as [string, ...string[]];

// The exact shape we ask Claude to return.
const DetectionSchema = z.object({
  pieces: z
    .array(
      z.object({
        name: z.string().describe("Short, friendly item name, 2-5 words, e.g. 'Cream linen shirt'"),
        category: z.enum(categoryValues),
        colour: z.string().describe("Main colour in plain words, e.g. 'Navy' or 'Black and white'"),
        season: z.enum(seasonValues),
        description: z
          .string()
          .describe("One sentence describing the garment's look (fabric, cut, pattern, details) for an image generator"),
      }),
    )
    .describe("Every distinct clothing item, shoe or accessory clearly visible. Empty if none."),
});

export type DetectedPiece = z.infer<typeof DetectionSchema>["pieces"][number];
export type DetectResult =
  | { ok: true; pieces: DetectedPiece[] }
  | { ok: false; reason: "no-key" | "failed" };

const SYSTEM = `You catalogue clothing for a personal wardrobe app.
Look at the photo and list each separate wearable item you can clearly see: tops, bottoms, dresses, outerwear, shoes and accessories (bags, hats, belts, jewellery, scarves).
- A person wearing an outfit counts: list the top and bottom (or dress) separately, plus visible shoes/outerwear/accessories.
- Skip items that are mostly hidden, cut off, or too blurry to describe.
- List each item once, even if it appears twice.
- category must be one of: ${categoryValues.join(", ")}. Jumpsuits and dresses are "dress"; jackets, coats, blazers and cardigans worn open are "outerwear".
- season: the season the item suits best, or "all" if it works year-round.
- Never describe the person (face, body, skin, age); only the clothes.`;

let client: Anthropic | null = null;

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function detectClothes(image: Uint8Array, mediaType: "image/jpeg" | "image/png" | "image/webp"): Promise<DetectResult> {
  if (!aiConfigured()) return { ok: false, reason: "no-key" };
  client ??= new Anthropic();

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low", format: betaZodOutputFormat(DetectionSchema) },
      // If Claude Opus 5.5 declines, the API retries on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: Buffer.from(image).toString("base64") },
            },
            { type: "text", text: "List the clothing items in this photo." },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      console.error("Clothes detection returned no result:", response.stop_reason);
      return { ok: false, reason: "failed" };
    }
    return { ok: true, pieces: response.parsed_output.pieces.slice(0, 8) };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key is invalid.");
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Anthropic rate limit hit.");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
    } else {
      console.error("Clothes detection failed:", error);
    }
    return { ok: false, reason: "failed" };
  }
}
