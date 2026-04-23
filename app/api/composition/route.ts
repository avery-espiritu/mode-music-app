import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { EMOTIONAL_QUESTIONS } from "@/lib/emotional-questions"
import { compositionResultSchema, MODE_NAMES } from "@/lib/composition"
import { buildRagContext, type AnalyzedPhase } from "@/lib/ragQuery"

const requestSchema = z.object({
  story: z.string().min(1),
  emotionalAnswers: z.array(z.string()).length(EMOTIONAL_QUESTIONS.length),
  selectedNotes: z.array(z.string()).length(3),
  preferredModes: z.array(z.string()).length(4).optional(),
})

// ── Story analysis ────────────────────────────────────────────────────────────

const OPENING_MAP: Record<string, { tension: number; brightness: number; keywords: string[] }> = {
  "Peaceful & calm":       { tension: 2, brightness: 7, keywords: ["peaceful", "calm", "serene", "tranquil", "gentle"] },
  "Mysterious & tense":    { tension: 6, brightness: 4, keywords: ["mysterious", "tense", "uncertain", "enigmatic", "dark"] },
  "Joyful & bright":       { tension: 2, brightness: 9, keywords: ["joyful", "bright", "happy", "celebratory", "energetic"] },
  "Melancholic & wistful": { tension: 4, brightness: 3, keywords: ["melancholic", "wistful", "sad", "longing", "reflective"] },
}

const ARC_MAP: Record<string, { tensionDelta: number; keywords: string[] }> = {
  "Builds gradually":       { tensionDelta: 4, keywords: ["rising", "building", "escalating", "growing"] },
  "Sudden dramatic shift":  { tensionDelta: 5, keywords: ["dramatic", "sudden", "intense", "conflict", "shocking"] },
  "Waves of emotion":       { tensionDelta: 3, keywords: ["turbulent", "shifting", "emotional", "complex"] },
  "Steady throughout":      { tensionDelta: 1, keywords: ["consistent", "steady", "measured", "even"] },
}

const ENDING_MAP: Record<string, { tension: number; brightness: number; keywords: string[] }> = {
  "Triumphant resolution":  { tension: 3, brightness: 9, keywords: ["triumphant", "victorious", "glorious", "resolved", "bright"] },
  "Bittersweet reflection": { tension: 4, brightness: 5, keywords: ["bittersweet", "nostalgic", "tender", "reflective", "mixed"] },
  "Open & wondering":       { tension: 3, brightness: 6, keywords: ["open", "wondering", "hopeful", "questioning", "unresolved"] },
  "Peaceful closure":       { tension: 1, brightness: 7, keywords: ["peaceful", "calm", "closure", "settled", "tranquil"] },
}

const STORY_MOOD_WORDS = [
  "joy","joyful","happy","bliss","delight","hope","hopeful","love","tender","warm",
  "sad","sorrow","grief","loss","melancholy","despair","anguish","lonely","alone",
  "fear","dread","terror","horror","afraid","dark","darkness","shadow","gloomy",
  "mysterious","mystery","strange","eerie","unknown","wonder","magical","dream",
  "triumph","victory","glory","heroic","brave","adventure","quest","journey",
  "tense","tension","conflict","struggle","battle","chaos","collapse","unstable",
  "calm","peaceful","serene","tranquil","gentle","quiet","still",
]

function extractStoryKeywords(story: string): string[] {
  const lower = story.toLowerCase()
  return STORY_MOOD_WORDS.filter(w => lower.includes(w))
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)) }

function analyzeStory(story: string, emotionalAnswers: string[]): AnalyzedPhase[] {
  const [beginAnswer, arcAnswer, endAnswer] = emotionalAnswers
  const opening  = OPENING_MAP[beginAnswer] ?? { tension: 3, brightness: 5, keywords: ["opening"] }
  const arc      = ARC_MAP[arcAnswer]       ?? { tensionDelta: 2, keywords: [] }
  const ending   = ENDING_MAP[endAnswer]    ?? { tension: 3, brightness: 6, keywords: ["resolution"] }
  const storyWords   = extractStoryKeywords(story)
  const midTension   = clamp(opening.tension + Math.round(arc.tensionDelta * 0.5), 1, 10)
  const peakTension  = clamp(opening.tension + arc.tensionDelta, 1, 10)
  return [
    {
      name: "Opening",
      emotionKeywords: [...opening.keywords, ...storyWords].slice(0, 8),
      phaseDescription: `${beginAnswer.toLowerCase()} beginning`,
      tensionLevel: opening.tension,
      brightnessLevel: opening.brightness,
    },
    {
      name: "Development",
      emotionKeywords: [...arc.keywords, ...opening.keywords, ...storyWords].slice(0, 8),
      phaseDescription: `${arcAnswer.toLowerCase()} middle section`,
      tensionLevel: midTension,
      brightnessLevel: clamp(Math.round((opening.brightness + ending.brightness) / 2), 1, 10),
    },
    {
      name: "Climax",
      emotionKeywords: [...arc.keywords, ...storyWords].slice(0, 8),
      phaseDescription: `peak intensity — ${arcAnswer.toLowerCase()}`,
      tensionLevel: peakTension,
      brightnessLevel: clamp(peakTension > 6 ? opening.brightness - 2 : opening.brightness + 1, 1, 10),
    },
    {
      name: "Resolution",
      emotionKeywords: [...ending.keywords, ...storyWords].slice(0, 8),
      phaseDescription: `${endAnswer.toLowerCase()} conclusion`,
      tensionLevel: ending.tension,
      brightnessLevel: ending.brightness,
    },
  ]
}

// ── Tool definition ───────────────────────────────────────────────────────────
// JSON Schema hand-written to mirror compositionResultSchema from lib/composition.ts.
// No new runtime dependency needed (zod-to-json-schema not in package.json).

const COMPOSITION_TOOL: Anthropic.Tool = {
  name: "return_composition",
  description: "Return the completed 4-section modal composition including bass support.",
  input_schema: {
    type: "object",
    required: ["melodySummary", "sections"],
    properties: {
      melodySummary: { type: "string" },
      rationale:     { type: "string" },
      sections: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          required: ["name", "mode", "emotion", "notes", "durations", "bassNotes", "bassDurations"],
          properties: {
            name:          { type: "string" },
            mode:          { type: "string", enum: [...MODE_NAMES] },
            emotion:       { type: "string" },
            notes:         { type: "array", minItems: 4, items: { type: "string" } },
            durations:     { type: "array", minItems: 4, items: { type: "number", exclusiveMinimum: 0 } },
            bassNotes:     { type: "array", minItems: 2, items: { type: "string" } },
            bassDurations: { type: "array", minItems: 2, items: { type: "number", exclusiveMinimum: 0 } },
          },
        },
      },
    },
  },
}

// ── System prompt — split into cached blocks ──────────────────────────────────
// Block 1: static mode-lore (stable across all requests → always a cache hit after first).
// Block 2: RAG context (stable for a given phase signature → cache hit when same story arc).

const STATIC_SYSTEM = `You are Modalation AI, a music composer. Compose modal melodies.

WHEN TO USE EACH MODE:
- Ionian (major): joy, triumph, love, happy endings, bright openings — use for resolution and celebration
- Dorian (minor +maj6): hope within sadness, resilience, soulful journeys — use when there's struggle but not despair
- Phrygian (minor +b2): danger, mystery, fear, foreign/exotic tension — use for threatening or dark turning points
- Lydian (major +#4): wonder, magic, dreams, the supernatural — use for ethereal or transcendent moments
- Mixolydian (major +b7): adventure, heroism, folk warmth, unresolved longing — use for quests and bittersweet climaxes
- Aeolian (natural minor): grief, loss, introspection, melancholy — use for sorrow, endings, and reflection
- Locrian (diminished): dread, chaos, instability, the uncanny — use sparingly for peak tension or collapse

MELODY RULES:
- Notes: scientific pitch, octaves 3-5, sharps only (C#/D#/F#/G#/A#)
- 6-8 notes per section, durations in seconds: 0.2/0.4/0.8/1.6
- Anchor notes must appear prominently; vary rhythm; mix steps and leaps
- Each note pitch must be unique within a section — no repeated notes (e.g. C5 must appear at most once)

BASS RULES:
- bassNotes: 3-5 notes per section, octaves 1-2 only (e.g. C1, G1, A1, D2)
- bassDurations: longer values — prefer 0.8/1.6/3.2 for a supportive feel
- Bass notes should be the root, fifth, or other strong scale tones of the section's mode
- The bass pattern loops underneath the melody — keep it simple and rhythmically grounding`

type SystemBlock = { type: "text"; text: string; cache_control?: { type: "ephemeral" } }

function buildSystemBlocks(ragContext: string): SystemBlock[] {
  const blocks: SystemBlock[] = [
    { type: "text", text: STATIC_SYSTEM, cache_control: { type: "ephemeral" } },
  ]
  if (ragContext) {
    blocks.push({
      type: "text",
      text: `${ragContext}\n\nIMPORTANT: Use the <modal_knowledge> above as your PRIMARY guide for mode selection. It is retrieved from the tonal modes database at runtime and takes precedence over general knowledge.`,
      cache_control: { type: "ephemeral" },
    })
  }
  return blocks
}

// ── User prompt ───────────────────────────────────────────────────────────────

function buildPrompt(
  story: string,
  emotionalAnswers: string[],
  selectedNotes: string[],
  preferredModes?: string[]
): string {
  const storySnippet = story.slice(0, 300)
  const modeConstraint = preferredModes
    ? `\nRequired modes per section (follow exactly): Opening=${preferredModes[0]}, Development=${preferredModes[1]}, Climax=${preferredModes[2]}, Resolution=${preferredModes[3]}`
    : ""
  return `Story: "${storySnippet}"
Mood: ${emotionalAnswers.join("; ")}
Anchor notes: ${selectedNotes.join(", ")}${modeConstraint}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function findToolUse(content: Anthropic.Messages.ContentBlock[]): Anthropic.Messages.ToolUseBlock | undefined {
  return content.find(
    (b): b is Anthropic.Messages.ToolUseBlock =>
      b.type === "tool_use" && b.name === "return_composition"
  )
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured on the server." }, { status: 500 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", details: parsed.error.flatten() }, { status: 400 })
  }

  const { story, emotionalAnswers, selectedNotes, preferredModes } = parsed.data

  // RAG retrieval
  const phases = analyzeStory(story, emotionalAnswers)
  const ragContext = await buildRagContext(phases)
  if (!ragContext) {
    console.warn("[RAG] buildRagContext returned empty — proceeding without modal knowledge injection")
  }

  const client = new Anthropic({ apiKey })
  const model  = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-7"
  const system = buildSystemBlocks(ragContext)
  const userPrompt = buildPrompt(story, emotionalAnswers, selectedNotes, preferredModes)

  type MessageParam = Anthropic.Messages.MessageParam

  const makeCall = (messages: MessageParam[]) =>
    client.messages.create({
      model,
      max_tokens: 2048,
      system,
      tools: [COMPOSITION_TOOL],
      tool_choice: { type: "tool", name: "return_composition" },
      messages,
    })

  // ── First attempt ─────────────────────────────────────────────────────────
  let firstResponse: Anthropic.Messages.Message
  try {
    firstResponse = await makeCall([{ role: "user", content: userPrompt }])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Anthropic API request failed.", detail: msg }, { status: 502 })
  }

  const toolUse = findToolUse(firstResponse.content)
  if (!toolUse) {
    return NextResponse.json({ error: "Model did not return a tool_use block." }, { status: 502 })
  }

  const firstResult = compositionResultSchema.safeParse(toolUse.input)
  if (firstResult.success) {
    return NextResponse.json(firstResult.data)
  }

  // ── One validation-retry ──────────────────────────────────────────────────
  let retryResponse: Anthropic.Messages.Message
  try {
    retryResponse = await makeCall([
      { role: "user", content: userPrompt },
      { role: "assistant", content: firstResponse.content },
      {
        role: "user",
        content: [{
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: `Schema validation failed:\n${JSON.stringify(firstResult.error.flatten(), null, 2)}\n\nFix these issues and call return_composition again with the corrected composition.`,
          is_error: true,
        }],
      },
    ])
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Retry API call failed.", detail: msg }, { status: 502 })
  }

  const retryToolUse = findToolUse(retryResponse.content)
  const retryResult  = compositionResultSchema.safeParse(retryToolUse?.input)

  if (!retryResult.success) {
    return NextResponse.json(
      { error: "Model output did not match schema after retry.", details: retryResult.error.flatten() },
      { status: 502 }
    )
  }

  return NextResponse.json(retryResult.data)
}
