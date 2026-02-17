import { openai } from "@/lib/ai/openai";
import { getModel } from "@/lib/ai/model";
import { db } from "@/lib/db";
import { editPlans } from "@/lib/db/schema";

interface SceneInput {
  id: string;
  startMs: number;
  endMs: number;
  label: string;
  confidence: number;
  transcriptText: string;
}

interface EditPlanGeneratorInput {
  scenes: SceneInput[];
  targetFormat: string;
  targetDurationMs?: number;
  projectId: string;
  orgId: string;
  userId: string;
}

interface SceneSequenceItem {
  sceneId: string;
  transitionType: string;
  transitionDurationMs: number;
}

interface EditPlanOutput {
  name: string;
  sceneSequence: SceneSequenceItem[];
  estimatedDurationMs: number;
  reasoning: string;
}

const SYSTEM_PROMPT = `You are an expert video editor AI assistant. Your job is to analyze a set of detected scenes from a video and create an optimal edit plan.

You must:
1. **Select scenes**: Choose which scenes to include based on content quality, relevance, and narrative flow. Consider confidence scores — prefer scenes with higher detection confidence.
2. **Order scenes**: Arrange scenes in the most compelling order for the target format.
3. **Assign transitions**: Choose appropriate transition types between scenes (cut, dissolve, fade, wipe, slide).
4. **Estimate duration**: Calculate the total estimated duration of the final edit in milliseconds.
5. **Name the plan**: Give the edit plan a descriptive name.
6. **Explain reasoning**: Describe why you selected and ordered scenes this way.

If a target duration is specified, trim or select scenes to approximate that duration. For short-form content (reels, shorts), prioritize the most engaging moments. For long-form, maintain narrative coherence.`;

const RESPONSE_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "edit_plan",
    strict: true,
    schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Descriptive name for the edit plan" },
        sceneSequence: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sceneId: { type: "string", description: "ID of the scene to include" },
              transitionType: {
                type: "string",
                description: "Transition type: cut, dissolve, fade, wipe, or slide",
              },
              transitionDurationMs: {
                type: "number",
                description: "Transition duration in milliseconds",
              },
            },
            required: ["sceneId", "transitionType", "transitionDurationMs"],
            additionalProperties: false,
          },
        },
        estimatedDurationMs: {
          type: "number",
          description: "Total estimated duration in milliseconds",
        },
        reasoning: { type: "string", description: "Explanation of editing decisions" },
      },
      required: ["name", "sceneSequence", "estimatedDurationMs", "reasoning"],
      additionalProperties: false,
    },
  },
};

export async function generateEditPlan(input: EditPlanGeneratorInput) {
  const userMessage = buildUserMessage(input);
  const model = getModel("LLM_MODEL_EDIT", "gpt-4o-mini");

  let result: EditPlanOutput;
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: RESPONSE_SCHEMA,
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned an empty response");
    result = JSON.parse(content);
  } catch {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `${userMessage}\n\n` +
            "Return only valid JSON with keys: " +
            "name, sceneSequence, estimatedDurationMs, reasoning.",
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned an empty response");
    result = JSON.parse(content);
  }

  const normalized: EditPlanOutput = {
    name: result.name ?? "AI Edit Plan",
    sceneSequence: Array.isArray(result.sceneSequence) ? result.sceneSequence : [],
    estimatedDurationMs:
      typeof result.estimatedDurationMs === "number"
        ? result.estimatedDurationMs
        : 0,
    reasoning: result.reasoning ?? "",
  };

  // Save to database
  const sceneIds = normalized.sceneSequence.map((s) => s.sceneId);
  const transitions = normalized.sceneSequence.map((s) => ({
    sceneId: s.sceneId,
    type: s.transitionType,
    durationMs: s.transitionDurationMs,
  }));

  const [plan] = await db
    .insert(editPlans)
    .values({
      projectId: input.projectId,
      orgId: input.orgId,
      name: normalized.name,
      sceneIds: JSON.stringify(sceneIds),
      transitions: JSON.stringify(transitions),
      status: "draft",
      createdBy: input.userId,
    })
    .returning();

  return {
    id: plan.id,
    name: normalized.name,
    sceneSequence: normalized.sceneSequence,
    estimatedDurationMs: normalized.estimatedDurationMs,
    reasoning: normalized.reasoning,
    projectId: input.projectId,
    status: "draft",
    createdAt: plan.createdAt,
  };
}

function buildUserMessage(input: EditPlanGeneratorInput): string {
  let message = `Create an edit plan for the following scenes.\n\n`;
  message += `**Target Format**: ${input.targetFormat}\n`;

  if (input.targetDurationMs) {
    message += `**Target Duration**: ${input.targetDurationMs}ms (${(input.targetDurationMs / 1000).toFixed(1)}s)\n`;
  }

  message += `\n**Available Scenes** (${input.scenes.length} total):\n\n`;

  for (const scene of input.scenes) {
    message += `- **Scene ${scene.id}**: ${scene.startMs}ms – ${scene.endMs}ms`;
    message += ` | Label: "${scene.label}" | Confidence: ${(scene.confidence * 100).toFixed(0)}%\n`;
    if (scene.transcriptText) {
      message += `  Transcript: "${scene.transcriptText.slice(0, 200)}"\n`;
    }
  }

  return message;
}
