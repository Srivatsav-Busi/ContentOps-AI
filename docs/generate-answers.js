const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  LevelFormat, PageBreak, Header, Footer, PageNumber, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, VerticalAlign,
} = require("docx");

const PRIMARY = "4338CA";
const DARK = "1E1B4B";
const GRAY = "64748B";
const LIGHT_BG = "EEF2FF";
const TABLE_HEADER_BG = "C7D2FE";
const WHITE = "FFFFFF";

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

function headerCell(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: TABLE_HEADER_BG, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: DARK })]
    })]
  });
}

function dataCell(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, size: 20, font: "Arial" })]
    })]
  });
}

function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { before: 0, after: 0 },
    indent: { left: 360 },
    shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
    children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "334155" })]
  }));
}

function bullet(ref, text, boldPrefix) {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix, bold: true, size: 22, font: "Arial" }));
    children.push(new TextRun({ text: " " + text, size: 22, font: "Arial" }));
  } else {
    children.push(new TextRun({ text, size: 22, font: "Arial" }));
  }
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { before: 60, after: 60 },
    children,
  });
}

function bodyText(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    children: [new TextRun({ text, size: 22, font: "Arial" })],
  });
}

function bodyRich(runs) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    children: runs,
  });
}

function subHeading(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: PRIMARY })],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 52, bold: true, color: DARK, font: "Arial" },
        paragraph: { spacing: { before: 0, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: PRIMARY, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: DARK, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bl1", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bl7", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n4", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n5", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "n6", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "ContentOps AI \u2014 Technical Architecture Document", italics: true, size: 18, color: GRAY, font: "Arial" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 18, color: GRAY, font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRAY, font: "Arial" }),
            new TextRun({ text: " of ", size: 18, color: GRAY, font: "Arial" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: GRAY, font: "Arial" })
          ]
        })]
      })
    },
    children: [
      // ─── COVER PAGE ──────────────────────────────────────────────────
      new Paragraph({ spacing: { before: 3600 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "ContentOps AI", size: 64, bold: true, color: PRIMARY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Multi-Agent Video Content Platform", size: 32, color: DARK, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Technical Architecture & Design Answers", size: 28, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Based on Actual Implementation", size: 22, bold: true, color: DARK, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "Project: /Video_generation/contentops", size: 20, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "Stack: Next.js 16 \u2022 TypeScript \u2022 Drizzle ORM \u2022 SQLite \u2022 OpenAI GPT-4o \u2022 FFmpeg", size: 20, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "February 2026", size: 20, color: GRAY, font: "Arial" })]
      }),

      // ─── PAGE BREAK ──────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 1
      // ════════════════════════════════════════════════════════════════
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 1: Multi-Agent System Design for Automated Video Editing")]
      }),

      bodyText("In our ContentOps AI platform, we designed and implemented a multi-agent architecture where specialized AI agents collaborate through a shared database to automate the complete video editing workflow \u2014 from raw footage ingestion to a finished, render-ready edit plan with trimmed clips and transitions."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Architecture Overview")] }),

      bodyText("The system decomposes video editing into discrete, composable stages, each handled by a dedicated agent. Our implementation uses four core agents, all powered by OpenAI\u2019s GPT-4o model via the Chat Completions API with structured output (JSON Schema response_format):"),

      new Table({
        columnWidths: [2200, 2600, 4560],
        rows: [
          new TableRow({ tableHeader: true, children: [
            headerCell("Agent", 2200),
            headerCell("Model / Tool", 2600),
            headerCell("Responsibility", 4560),
          ]}),
          new TableRow({ children: [
            dataCell("Scene Detector", 2200),
            dataCell("FFmpeg scene filter + ffprobe", 2600),
            dataCell("Analyzes raw video, detects scene boundaries using FFmpeg\u2019s gt(scene,0.3) filter, extracts timestamps, confidence scores, and thumbnail frames.", 4560),
          ]}),
          new TableRow({ children: [
            dataCell("Edit Plan Generator", 2200),
            dataCell("GPT-4o (structured output)", 2600),
            dataCell("Receives detected scenes with metadata. Selects which scenes to include, determines optimal ordering, assigns transition types (cut, dissolve, fade, wipe, slide) with durations, and estimates total runtime.", 4560),
          ]}),
          new TableRow({ children: [
            dataCell("SEO Generator", 2200),
            dataCell("GPT-4o (structured output)", 2600),
            dataCell("Takes the video transcript and generates SEO-optimized titles, descriptions, chapter markers, keywords with search volume estimates, and platform-specific hashtags.", 4560),
          ]}),
          new TableRow({ children: [
            dataCell("Anomaly Explainer", 2200),
            dataCell("GPT-4o (structured output)", 2600),
            dataCell("Monitors KPI dashboards, and when an anomaly is detected, generates a plain-English explanation of what happened and suggests corrective actions.", 4560),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Why GPT-4o with Structured Output?")] }),

      bodyText("We chose GPT-4o as the backbone model for all AI agents for three key reasons:"),

      bullet("bl1", "GPT-4o delivers the best combination of reasoning quality and speed for production workloads. Its multi-modal capabilities (text + vision) allow us to extend agents to analyze video frames directly in the future.", "Performance:"),
      bullet("bl1", 'We use response_format: { type: "json_schema" } with strict: true to guarantee the model returns valid, typed JSON matching our schema. For example, the Edit Plan Generator\'s schema enforces that every scene in the sequence has a sceneId, transitionType, and transitionDurationMs. This eliminates parsing failures and lets us write directly to the database.', "Structured Output:"),
      bullet("bl1", "Unlike the Assistants API (which manages conversation threads server-side), we use the stateless Chat Completions API. Each agent call is a single request/response with a carefully crafted system prompt + user message. This gives us full control over context, costs, and latency.", "Stateless Design:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Implementation: Edit Plan Generator Agent")] }),

      bodyText("Our edit-plan-generator.ts (src/lib/ai/agents/edit-plan-generator.ts) demonstrates the pattern used across all agents:"),

      ...codeBlock([
        "// System prompt defines the agent's expertise and constraints",
        "const SYSTEM_PROMPT = `You are an expert video editor AI assistant...`",
        "",
        "// JSON Schema enforces output structure",
        'const RESPONSE_SCHEMA = { type: "json_schema", json_schema: {',
        '  name: "edit_plan", strict: true,',
        "  schema: { type: \"object\", properties: {",
        '    name: { type: "string" },',
        '    sceneSequence: { type: "array", items: {',
        "      properties: {",
        '        sceneId: { type: "string" },',
        '        transitionType: { type: "string" },  // cut|dissolve|fade|wipe|slide',
        '        transitionDurationMs: { type: "number" }',
        "      }",
        "    }},",
        '    estimatedDurationMs: { type: "number" },',
        '    reasoning: { type: "string" }',
        "  }}",
        "}}",
        "",
        "// Single API call with structured response",
        "const response = await openai.chat.completions.create({",
        '  model: "gpt-4o",',
        "  messages: [{ role: \"system\", content: SYSTEM_PROMPT }, { role: \"user\", content: userMessage }],",
        "  response_format: RESPONSE_SCHEMA,",
        "  temperature: 0.6",
        "});",
        "",
        "// Result is saved directly to the edit_plans table via Drizzle ORM",
        "const [plan] = await db.insert(editPlans).values({...}).returning();"
      ]),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Agent Communication Pattern")] }),

      bodyText("Agents communicate through the shared SQLite database rather than direct message-passing. The workflow is:"),

      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "User uploads a video \u2192 ", size: 22, font: "Arial" }),
        new TextRun({ text: "Upload API", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " saves file, triggers FFmpeg metadata extraction and thumbnail generation. Writes to video_assets table.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Scene Detector", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " runs FFmpeg's scene filter on the video, writes detected scenes to the scenes table with start/end timestamps and confidence scores.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Edit Plan Generator", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " reads scenes from DB, sends them to GPT-4o with format/duration constraints, receives a structured edit plan, and writes it to edit_plans table.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n1", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "SEO Generator", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " reads the video transcript, generates SEO metadata, and writes to seo_briefs, keywords, and hashtags tables.", size: 22, font: "Arial" }),
      ]}),

      bodyText("This database-mediated architecture means agents are decoupled, can be triggered independently, and each agent's output is immediately available for the next step or for the frontend to display."),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 2
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 2: Python Libraries (OpenCV/FFmpeg) + AI for Video Manipulation")]
      }),

      bodyText("In our ContentOps AI platform, we built a complete video processing pipeline using FFmpeg (via the fluent-ffmpeg Node.js wrapper) integrated with OpenAI for content-aware editing decisions. Here is how each component works in our actual implementation."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("FFmpeg: The Video Processing Foundation")] }),

      bodyText("We created two core modules at src/lib/video/:"),

      subHeading("1. processor.ts \u2014 Metadata Extraction & Thumbnail Generation"),

      bodyText("This module provides three functions, all using fluent-ffmpeg under the hood:"),

      bullet("bl2", 'Uses ffprobe to extract duration, resolution (e.g. "1920x1080"), codec (h264/prores), file size, and FPS from any uploaded video. Returns a typed VideoMetadata object.', "extractMetadata(filePath):"),
      bullet("bl2", "Seeks to a specific timestamp and extracts a single frame as WebP (640px wide, quality 80). We use this to generate a hero thumbnail at 25% of the video duration during upload processing.", "generateThumbnail(filePath, timestampSec, outputPath):"),
      bullet("bl2", "Calculates evenly-spaced intervals across the video duration and extracts N thumbnails. This creates a visual timeline overview for the editing UI.", "generateThumbnailGrid(filePath, count, outputDir):"),

      subHeading("2. scene-detector.ts \u2014 Automated Scene Detection"),

      bodyText("This module uses FFmpeg\u2019s built-in scene detection filter to identify scene boundaries without any external ML model:"),

      ...codeBlock([
        "// Uses FFmpeg's scene detection: select='gt(scene,0.3)',showinfo",
        "// Parses pts_time from stderr output to get scene-change timestamps",
        "// Default threshold: 0.3 (configurable for sensitivity)",
        "export function detectScenes(filePath, threshold = 0.3): Promise<DetectedScene[]>",
        "",
        "// Returns: [{ startMs: 0, endMs: 4500, score: 0.45 }, ...]",
      ]),

      bodyText("The detector parses FFmpeg\u2019s stderr output line-by-line, extracting pts_time and scene scores using regex patterns. Scene-change timestamps are then converted into segments with start/end boundaries."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Integration with OpenAI for Content-Aware Edits")] }),

      bodyText("The critical innovation is how we bridge FFmpeg\u2019s frame-level analysis with GPT-4o\u2019s semantic understanding:"),

      new Paragraph({ numbering: { reference: "n2", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "FFmpeg detects scenes", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 Identifies where visual cuts happen (frame difference > threshold). This gives us raw temporal segments.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n2", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Whisper transcribes audio", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 Each scene segment is enriched with its corresponding transcript text (aligned by timestamp).", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n2", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "GPT-4o makes editing decisions", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 The Edit Plan Generator receives scenes with labels, confidence scores, timestamps, and transcript text. It understands the narrative content and can make intelligent decisions like: \u201Ckeep the product demo scene, skip the shaky B-roll, use a dissolve transition into the testimonial.\u201D", size: 22, font: "Arial" }),
      ]}),

      bodyText("This pipeline runs on every video upload. The upload endpoint (src/app/api/v1/assets/upload/route.ts) accepts multipart form data, saves the file to disk, extracts metadata via ffprobe, generates a thumbnail, and updates the database record \u2014 all synchronously during the upload request."),

      subHeading("Why FFmpeg instead of OpenCV?"),

      bodyText("We chose FFmpeg (Node.js via fluent-ffmpeg) over OpenCV (Python) for this phase because: (1) It eliminates the need for a separate Python service, keeping the entire stack in one Next.js process. (2) FFmpeg\u2019s scene detection filter is battle-tested and extremely fast for temporal analysis. (3) For future computer-vision tasks (object detection, face tracking), we would add a FastAPI sidecar with OpenCV/PyTorch, communicating via HTTP with the Next.js backend."),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 4
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 3: SEO-Optimized Video Description Agent with NLP")]
      }),

      bodyText("Our SEO generation agent (src/lib/ai/agents/seo-generator.ts) is one of the most fully-realized components in ContentOps AI. It uses GPT-4o with structured output to generate comprehensive SEO metadata from video transcripts."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Agent Design & System Prompt Engineering")] }),

      bodyText("The agent is initialized with a detailed system prompt that establishes it as an \u201Cexpert SEO specialist for video content platforms.\u201D The prompt defines seven specific responsibilities:"),

      bullet("bl3", "Generate an SEO-optimized title under 60 characters with front-loaded primary keyword", "Title Generation:"),
      bullet("bl3", "Write keyword-rich description (150+ chars) with the most important keywords in the first 2 lines (which appear in search previews)", "Description Writing:"),
      bullet("bl3", "Suggest 8\u201310 chapter timestamps with descriptive titles based on transcript content analysis", "Chapter Markers:"),
      bullet("bl3", "Short, punchy text (2\u20135 words) optimized for click-through rate", "Thumbnail Text:"),
      bullet("bl3", "5\u20138 keywords with estimated monthly search volume and difficulty scores (0\u2013100). The prompt explicitly instructs: \u201Cprioritize long-tail keywords with reasonable volume and low difficulty.\u201D", "Keyword Research:"),
      bullet("bl3", "10\u201315 hashtags tagged by platform (youtube, instagram, or both)", "Hashtag Generation:"),
      bullet("bl3", "The agent explains its SEO strategy, making the output transparent and editable by content teams", "Strategy Reasoning:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("OpenAI Features Leveraged")] }),

      new Table({
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({ tableHeader: true, children: [
            headerCell("Feature", 3120),
            headerCell("How We Use It", 6240),
          ]}),
          new TableRow({ children: [
            dataCell("Structured Output (JSON Schema)", 3120),
            dataCell("response_format with strict: true ensures every API call returns valid JSON matching our SEOBriefOutput schema. This guarantees we get title, description, chapters[], keywords[], and hashtags[] in the exact format our database expects.", 6240),
          ]}),
          new TableRow({ children: [
            dataCell("System Prompt as Agent Persona", 3120),
            dataCell("The SYSTEM_PROMPT defines the agent's expertise, constraints, and quality standards. It acts as a persistent \"role card\" that shapes every response.", 6240),
          ]}),
          new TableRow({ children: [
            dataCell("Temperature Control (0.7)", 3120),
            dataCell("Set to 0.7 for creative SEO copy \u2014 higher than the edit planner (0.6) since we want diverse, engaging titles and descriptions, not mechanical output.", 6240),
          ]}),
          new TableRow({ children: [
            dataCell("Context-Aware Personalization", 3120),
            dataCell("The user message includes platform (YouTube/Instagram/both), target audience, and brand voice. GPT-4o adapts its keyword strategy, hashtag selection, and tone accordingly.", 6240),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Database Integration")] }),

      bodyText("After GPT-4o returns the structured response, the agent performs three database writes in sequence:"),

      new Paragraph({ numbering: { reference: "n3", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Inserts into seo_briefs", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 Title, description, chapters (JSON), thumbnail text, platform, target audience, version number, and creator user ID.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n3", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Batch inserts into keywords", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 Each keyword with its search volume, difficulty score, and rank order.", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n3", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Batch inserts into hashtags", bold: true, size: 22, font: "Arial" }),
        new TextRun({ text: " \u2014 Each hashtag with its target platform and rank.", size: 22, font: "Arial" }),
      ]}),

      bodyText("The API endpoint (POST /api/v1/ai/seo-generate) validates that the user owns the project and asset, retrieves the transcript from the transcripts table, and returns the generated brief with its database ID for immediate display in the frontend."),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 5
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 4: Automating Social Publishing (Instagram, YouTube)")]
      }),

      bodyText("ContentOps AI\u2019s publishing system is designed around a campaign \u2192 scheduled posts \u2192 publish events pipeline. Our database schema and API layer fully support this workflow."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Database Schema for Publishing")] }),

      bodyText("We designed five interconnected tables for the publishing pipeline:"),

      bullet("bl4", "Stores OAuth tokens for connected platforms (YouTube, Instagram, etc.) with provider, provider_uid, access_token, refresh_token, token_expires_at, and scopes.", "social_accounts:"),
      bullet("bl4", "Groups scheduled posts under a project with start/end dates and status tracking.", "campaigns:"),
      bullet("bl4", "Each post has a target platform, scheduled_at timestamp, timezone, title, description, hashtags (JSON), and references to the export file and social account.", "scheduled_posts:"),
      bullet("bl4", "Immutable log of every publish attempt with platform_post_id, status, error_code, error_message, retry_count, and platform_url.", "publish_events:"),
      bullet("bl4", "The rendered video file linked to the post.", "exports:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Authentication: OAuth 2.0 + PKCE")] }),

      bodyText("For platform APIs (Instagram Graph API, YouTube Data API v3), the authentication flow works as follows:"),

      new Paragraph({ numbering: { reference: "n4", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "User clicks \u201CConnect YouTube\u201D in the Integrations page (/app/integrations)", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n4", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Frontend redirects to the platform\u2019s OAuth consent screen with PKCE code challenge", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n4", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Callback exchanges auth code for access + refresh tokens", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n4", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Tokens are encrypted and stored in social_accounts table per org", size: 22, font: "Arial" }),
      ]}),
      new Paragraph({ numbering: { reference: "n4", level: 0 }, spacing: { before: 60, after: 60 }, children: [
        new TextRun({ text: "Token refresh happens automatically when token_expires_at is approaching", size: 22, font: "Arial" }),
      ]}),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Scheduling & Publishing Architecture")] }),

      bodyText("The publishing pipeline operates in three phases:"),

      subHeading("Phase A: Content Preparation"),
      bodyText("After a video is rendered and exported, the SEO agent generates platform-specific descriptions and hashtags. The user reviews and approves the content in the Publishing Queue UI (/app/publishing/queue), sets the schedule time, and assigns it to a connected social account."),

      subHeading("Phase B: Scheduled Execution"),
      bodyText("A background job (designed for a cron trigger or Temporal workflow) polls for scheduled_posts where scheduled_at <= now AND status = 'approved'. For each post, it: (1) retrieves the OAuth token from social_accounts, (2) calls the platform API (e.g., YouTube Data API\u2019s videos.insert or Instagram Graph API\u2019s media endpoint), (3) records the result as a publish_event with success/failure status."),

      subHeading("Phase C: Monitoring & Retry"),
      bodyText("The Publish Logs page (/app/publishing/logs) displays all publish_events. Failed posts are automatically retried up to 3 times (tracked via retry_count). Each attempt creates a new publish_event record for full auditability."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Platform API Integration Points")] }),

      new Table({
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({ tableHeader: true, children: [
            headerCell("Platform", 2340),
            headerCell("API Endpoint", 3510),
            headerCell("Key Scopes", 3510),
          ]}),
          new TableRow({ children: [
            dataCell("YouTube", 2340),
            dataCell("youtube.videos.insert (resumable upload)", 3510),
            dataCell("youtube.upload, youtube.force-ssl", 3510),
          ]}),
          new TableRow({ children: [
            dataCell("Instagram", 2340),
            dataCell("Graph API: /me/media + /me/media_publish", 3510),
            dataCell("instagram_content_publish, pages_read_engagement", 3510),
          ]}),
          new TableRow({ children: [
            dataCell("TikTok", 2340),
            dataCell("Content Posting API: /v2/post/publish/video/", 3510),
            dataCell("video.publish, video.upload", 3510),
          ]}),
        ]
      }),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 6
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 5: AI-Powered KPI Dashboard Architecture")]
      }),

      bodyText("ContentOps AI includes a fully implemented KPI dashboard system with AI-powered anomaly detection and automated report generation. Here is the complete architecture."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Database Foundation (4 Tables)")] }),

      bodyText("The analytics layer is built on four interconnected tables in our SQLite schema:"),

      bullet("bl5", "Organizational container for KPIs. Has name, description, layout_json (widget positions), template (e.g. \"cross_platform\"), and is_default flag.", "dashboards:"),
      bullet("bl5", "Individual metrics within a dashboard. Fields: name, metric_type (views, engagement_rate, watch_time, subscribers), source (youtube, instagram), viz_type (number, line, bar), target_value, comparison period (wow/mom), and position_json for layout.", "kpi_configs:"),
      bullet("bl5", "Timestamped data points for each KPI. Indexed by (kpi_id, timestamp) for fast range queries. Stores value as a real number with optional JSON metadata.", "time_series:"),
      bullet("bl5", "Detected anomalies with severity, actual_value, expected_value, deviation_pct, status (open/resolved), and AI-generated explanation.", "anomalies:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("AI Components")] }),

      subHeading("1. Anomaly Detection + Explanation (GPT-4o)"),

      bodyText("When a KPI value deviates significantly from expected, the Anomaly Explainer agent is triggered. Our implementation in src/lib/ai/agents/anomaly-explainer.ts:"),

      bullet("bl6", "Receives the KPI name, actual vs. expected values, deviation percentage, severity, and the last 30 data points as context.", "Input:"),
      bullet("bl6", "GPT-4o (temperature 0.5 for factual accuracy) with a system prompt defining it as a \u201Cdata analytics expert specializing in content performance metrics.\u201D", "Model:"),
      bullet("bl6", "Structured JSON: { explanation: string, suggestedActions: string[] }. The explanation is 2\u20133 sentences written \u201Cas if explaining to a marketing manager, not a data scientist.\u201D", "Output:"),
      bullet("bl6", "The API endpoint (POST /api/v1/ai/anomaly-explain) updates the anomaly record\u2019s explanation field in the database, making it immediately visible in the dashboard UI.", "Persistence:"),

      subHeading("2. Report Summary Writer (GPT-4o)"),

      bodyText("The Report Writer agent (src/lib/ai/agents/report-writer.ts) generates executive summaries:"),

      bullet("bl7", "Dashboard name, array of KPIs (each with current/previous/target values and trend), and the reporting period.", "Input:"),
      bullet("bl7", "A 3-paragraph executive summary following a strict structure: (1) Key Wins, (2) Areas of Concern, (3) Recommendations. The system prompt mandates: \u201CInclude specific numbers and percentages\u201D and \u201CKeep under 300 words.\u201D", "Output:"),
      bullet("bl7", "The prompt pre-computes percentage changes and vs-target metrics in the user message, so GPT-4o can reference exact figures rather than hallucinating numbers.", "Data Preparation:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Architecture Diagram")] }),

      ...codeBlock([
        "\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
        "\u2502 Data Sources    \u2502 \u2500\u2500\u2500> \u2502 time_series     \u2502 \u2500\u2500\u2500> \u2502 Dashboard UI   \u2502",
        "\u2502 (YouTube, IG)   \u2502     \u2502 (SQLite table)  \u2502     \u2502 (Recharts/     \u2502",
        "\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518     \u2502  TanStack Query)\u2502",
        "                            \u2502                   \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
        "                     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
        "                     \u2502 Anomaly Detect  \u2502",
        "                     \u2502 (threshold rule) \u2502",
        "                     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
        "                            \u2502",
        "                     \u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510",
        "                     \u2502 GPT-4o Explainer \u2502 \u2500\u2500\u2500> anomalies.explanation",
        "                     \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518",
      ]),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Real-Time Updates")] }),

      bodyText("The frontend dashboard pages use TanStack Query hooks (useDashboards(), from src/lib/hooks/use-api.ts) with configurable refetch intervals. For the render queue, we poll every 5 seconds (refetchInterval: 5000). Dashboard data refreshes on window focus. The Zustand store manages client-side UI state (sidebar collapse, selected filters), while TanStack Query manages all server state with automatic cache invalidation after mutations."),

      // ════════════════════════════════════════════════════════════════
      // QUESTION 7
      // ════════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Question 6: Practical AI-Driven KPI Dashboard \u2014 ContentOps AI Case Study")]
      }),

      bodyText("ContentOps AI is the concrete implementation. Here is how we built it, the specific tools we used, and the challenges we addressed."),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Tools & Libraries Used")] }),

      new Table({
        columnWidths: [2340, 2700, 4320],
        rows: [
          new TableRow({ tableHeader: true, children: [
            headerCell("Layer", 2340),
            headerCell("Tool", 2700),
            headerCell("Role", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Frontend Framework", 2340),
            dataCell("Next.js 16 + TypeScript", 2700),
            dataCell("App Router with React Server Components for SSR/SSG. Static marketing pages, dynamic app pages.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("UI Components", 2340),
            dataCell("shadcn/ui + Tailwind CSS 4", 2700),
            dataCell("Pre-built accessible components (cards, tables, tabs, dropdowns) customized to our indigo brand palette.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Charts", 2340),
            dataCell("Recharts", 2700),
            dataCell("Line charts for time series, bar charts for subscriber growth, area charts for watch time. Responsive and interactive.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Server State", 2340),
            dataCell("TanStack Query", 2700),
            dataCell("Hooks like useDashboards() handle loading, caching, background refetch, and error states automatically.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Client State", 2340),
            dataCell("Zustand", 2700),
            dataCell("Lightweight store for UI state (sidebar toggle, active filters). No boilerplate.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Database", 2340),
            dataCell("SQLite + Drizzle ORM", 2700),
            dataCell("26 tables with typed schema. Time series indexed by (kpi_id, timestamp). WAL mode for concurrent reads.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("AI Intelligence", 2340),
            dataCell("OpenAI GPT-4o", 2700),
            dataCell("Structured output for anomaly explanations and report summaries. Consistent, typed JSON responses.", 4320),
          ]}),
          new TableRow({ children: [
            dataCell("Auth", 2340),
            dataCell("NextAuth.js v5", 2700),
            dataCell("JWT-based sessions with orgId and role claims. Credentials + OAuth providers.", 4320),
          ]}),
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Challenges & Solutions")] }),

      subHeading("Challenge 1: Data Quality"),
      bodyText("KPI data from external platforms (YouTube Analytics, Instagram Insights) arrives with varying latency, granularity, and occasional gaps. Our solution: the time_series table stores raw values with timestamps, and the dashboard frontend computes derived metrics (percentage changes, moving averages) client-side. Missing data points are handled gracefully \u2014 the UI shows the last known value with a \u201Cstale\u201D indicator rather than breaking charts."),

      subHeading("Challenge 2: Metric Drift"),
      bodyText("KPI definitions can change (e.g., YouTube changing how \u201Cviews\u201D are counted). We address this through the kpi_configs table which stores query_config as flexible JSON. When a metric definition changes, we update the config without losing historical data. The anomaly detection system uses deviation-based alerts (configurable thresholds in the alerts table), so a sudden shift in metric baseline triggers an anomaly that the GPT-4o Explainer can contextualize."),

      subHeading("Challenge 3: Making Visuals Actionable for Non-Technical Users"),
      bodyText("This was the core UX challenge. Our solutions:"),

      bullet("bl7", "Every anomaly gets a GPT-4o-generated explanation in plain English (\u201CYour views dropped 35% this week, likely due to publishing during a holiday weekend when audience engagement typically declines\u201D) plus 2\u20134 specific action items.", "AI-Powered Explanations:"),
      bullet("bl7", "The Report Writer generates 3-paragraph summaries (wins, concerns, recommendations) that executives can read in 60 seconds without opening the dashboard.", "Executive Summaries:"),
      bullet("bl7", "Each KPI card shows current value, trend direction, percentage change, and progress toward target at a glance. Color coding (green/yellow/red) uses our design system\u2019s semantic colors.", "Contextual KPI Cards:"),
      bullet("bl7", "Users configure alerts with simple rules (\u201Cnotify me if views drop below 800 in 24 hours\u201D) via the Alerts page (/app/alerts). Alerts fire to in-app notifications and email.", "Threshold Alerts:"),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Seed Data Demonstration")] }),

      bodyText("Our seed script (src/lib/db/seed.ts) populates the dashboard with realistic data: a \u201CChannel Overview\u201D dashboard with 4 KPIs (Total Views, Engagement Rate, Watch Time, New Subscribers), 31 days of time-series data with natural variance, and a sample alert rule. This allows immediate interaction with the dashboard after running the seed, demonstrating the full data flow from database through API to frontend visualization."),

      // ─── CLOSING ─────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Technology Stack Summary")]
      }),

      new Table({
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({ tableHeader: true, children: [
            headerCell("Category", 3120),
            headerCell("Technologies", 6240),
          ]}),
          new TableRow({ children: [ dataCell("Frontend", 3120), dataCell("Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts, TanStack Query, Zustand", 6240) ]}),
          new TableRow({ children: [ dataCell("Backend API", 3120), dataCell("Next.js API Routes (App Router), RESTful JSON envelope, CORS, cursor-based pagination", 6240) ]}),
          new TableRow({ children: [ dataCell("Database", 3120), dataCell("SQLite (better-sqlite3), Drizzle ORM, 26 tables, WAL mode, indexed queries", 6240) ]}),
          new TableRow({ children: [ dataCell("Authentication", 3120), dataCell("NextAuth.js v5, JWT strategy, bcrypt password hashing, RBAC (owner/admin/editor/viewer/billing)", 6240) ]}),
          new TableRow({ children: [ dataCell("AI / ML", 3120), dataCell("OpenAI GPT-4o, Structured Output (JSON Schema), 4 specialized agents", 6240) ]}),
          new TableRow({ children: [ dataCell("Video Processing", 3120), dataCell("FFmpeg (fluent-ffmpeg), scene detection, metadata extraction, WebP thumbnails", 6240) ]}),
          new TableRow({ children: [ dataCell("File Storage", 3120), dataCell("Local filesystem (data/uploads/{orgId}/{assetId}/), S3-ready storage key pattern", 6240) ]}),
        ]
      }),

      new Paragraph({ spacing: { before: 400 }, children: [] }),

      bodyRich([
        new TextRun({ text: "All answers in this document reference the actual, working implementation at ", size: 22, font: "Arial", italics: true, color: GRAY }),
        new TextRun({ text: "/Users/srivatsavbusi/Video_generation/contentops", size: 22, font: "Courier New", color: PRIMARY }),
        new TextRun({ text: ". The project builds successfully (npm run build) with zero TypeScript errors across 50 routes.", size: 22, font: "Arial", italics: true, color: GRAY }),
      ]),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = require("path").join(__dirname, "..", "ContentOps_AI_Technical_Answers.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated:", outPath);
});
