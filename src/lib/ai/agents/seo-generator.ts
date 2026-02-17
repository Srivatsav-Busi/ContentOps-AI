import { openai } from "@/lib/ai/openai";
import { getModel } from "@/lib/ai/model";
import { db } from "@/lib/db";
import { seoBriefs, keywords, hashtags } from "@/lib/db/schema";

interface SEOGeneratorInput {
  transcriptText: string;
  platform: "youtube" | "instagram" | "both";
  targetAudience?: string;
  brandVoice?: string;
  projectId: string;
  orgId: string;
  userId: string;
}

interface SEOChapter {
  time: string;
  title: string;
}

interface SEOKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
}

interface SEOHashtag {
  hashtag: string;
  platform: string;
}

interface SEOBriefOutput {
  title: string;
  description: string;
  chapters: SEOChapter[];
  thumbnailText: string;
  keywords: SEOKeyword[];
  hashtags: SEOHashtag[];
  reasoning: string;
}

function getSEOModel() {
  return getModel("LLM_MODEL_SEO", "gpt-4o-mini");
}

const SYSTEM_PROMPT = `You are an expert SEO specialist for video content platforms (YouTube, Instagram Reels, TikTok). Your job is to analyze video transcripts and generate highly optimized SEO metadata.

Your responsibilities:
1. **Title**: Generate an SEO-optimized title under 60 characters. Front-load the primary keyword. Make it compelling and click-worthy without being clickbait.
2. **Description**: Write a keyword-rich description of at least 150 characters. The first 2 lines must contain the most important keywords as they appear in search previews. Include a call to action.
3. **Chapters**: Suggest 8-10 chapter timestamps based on the transcript content. Each chapter should have a clear, descriptive title.
4. **Thumbnail Text**: Suggest short, punchy text (2-5 words) for the video thumbnail that drives clicks.
5. **Keywords**: Suggest 5-8 keywords with estimated monthly search volume and keyword difficulty (0-100 scale). Prioritize long-tail keywords with reasonable volume and low difficulty.
6. **Hashtags**: Suggest 10-15 hashtags. Tag each with the platform it's best suited for (youtube, instagram, or both).
7. **Reasoning**: Explain your SEO strategy and why you chose these specific optimizations.

Always consider the target audience and brand voice when provided.`;

const RESPONSE_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "seo_brief",
    strict: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "SEO-optimized title under 60 characters" },
        description: { type: "string", description: "Keyword-rich description, 150+ characters" },
        chapters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              time: { type: "string", description: "Timestamp like 0:00 or 1:23" },
              title: { type: "string", description: "Chapter title" },
            },
            required: ["time", "title"],
            additionalProperties: false,
          },
          description: "8-10 chapter timestamps",
        },
        thumbnailText: { type: "string", description: "Short punchy text for thumbnail" },
        keywords: {
          type: "array",
          items: {
            type: "object",
            properties: {
              keyword: { type: "string" },
              volume: { type: "number", description: "Estimated monthly search volume" },
              difficulty: { type: "number", description: "Keyword difficulty 0-100" },
            },
            required: ["keyword", "volume", "difficulty"],
            additionalProperties: false,
          },
          description: "5-8 keywords with volume and difficulty",
        },
        hashtags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              hashtag: { type: "string" },
              platform: { type: "string", description: "youtube, instagram, or both" },
            },
            required: ["hashtag", "platform"],
            additionalProperties: false,
          },
          description: "10-15 hashtags with platform tags",
        },
        reasoning: { type: "string", description: "Explanation of SEO strategy" },
      },
      required: ["title", "description", "chapters", "thumbnailText", "keywords", "hashtags", "reasoning"],
      additionalProperties: false,
    },
  },
};

export async function generateSEOBrief(input: SEOGeneratorInput) {
  const userMessage = buildUserMessage(input);
  const model = getSEOModel();

  let result: SEOBriefOutput;
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: RESPONSE_SCHEMA,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }
    result = JSON.parse(content);
  } catch {
    // Fallback for providers/models that don't support strict json_schema.
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${userMessage}\n\n` +
            "Return only valid JSON with keys: " +
            "title, description, chapters, thumbnailText, keywords, hashtags, reasoning.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("LLM returned an empty response");
    }
    result = JSON.parse(content);
  }

  const normalized: SEOBriefOutput = {
    title: result.title ?? "Generated SEO Title",
    description: result.description ?? "",
    chapters: Array.isArray(result.chapters) ? result.chapters : [],
    thumbnailText: result.thumbnailText ?? "",
    keywords: Array.isArray(result.keywords) ? result.keywords : [],
    hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
    reasoning: result.reasoning ?? "",
  };

  // Save to database
  const [brief] = await db
    .insert(seoBriefs)
    .values({
      projectId: input.projectId,
      orgId: input.orgId,
      title: normalized.title,
      description: normalized.description,
      chapters: JSON.stringify(normalized.chapters),
      thumbnailText: normalized.thumbnailText,
      targetAudience: input.targetAudience ?? null,
      platform: input.platform,
      createdBy: input.userId,
    })
    .returning();

  // Insert keywords
  if (normalized.keywords.length > 0) {
    await db.insert(keywords).values(
      normalized.keywords.map((kw, idx) => ({
        briefId: brief.id,
        keyword: kw.keyword,
        searchVolume: kw.volume,
        difficulty: kw.difficulty,
        rank: idx + 1,
      }))
    );
  }

  // Insert hashtags
  if (normalized.hashtags.length > 0) {
    await db.insert(hashtags).values(
      normalized.hashtags.map((ht, idx) => ({
        briefId: brief.id,
        hashtag: ht.hashtag,
        platform: ht.platform,
        rank: idx + 1,
      }))
    );
  }

  return {
    id: brief.id,
    ...normalized,
    projectId: input.projectId,
    platform: input.platform,
    createdAt: brief.createdAt,
  };
}

function buildUserMessage(input: SEOGeneratorInput): string {
  let message = `Analyze the following video transcript and generate SEO metadata.\n\n`;
  message += `**Platform**: ${input.platform}\n`;

  if (input.targetAudience) {
    message += `**Target Audience**: ${input.targetAudience}\n`;
  }
  if (input.brandVoice) {
    message += `**Brand Voice**: ${input.brandVoice}\n`;
  }

  message += `\n**Transcript**:\n${input.transcriptText}`;

  return message;
}
