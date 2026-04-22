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
// Maps the three emotional answers + story text into 4 annotated narrative phases
// so the RAG layer can retrieve relevant modal candidates per phase.

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

// Mood words scanned from the raw story text to enrich per-phase keyword sets
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

function analyzeStory(
  story: string,
  emotionalAnswers: string[],
): AnalyzedPhase[] {
  const [beginAnswer, arcAnswer, endAnswer] = emotionalAnswers

  const opening  = OPENING_MAP[beginAnswer] ?? { tension: 3, brightness: 5, keywords: ["opening"] }
  const arc      = ARC_MAP[arcAnswer]       ?? { tensionDelta: 2, keywords: [] }
  const ending   = ENDING_MAP[endAnswer]    ?? { tension: 3, brightness: 6, keywords: ["resolution"] }

  const storyWords = extractStoryKeywords(story)
  const midTension  = clamp(opening.tension + Math.round(arc.tensionDelta * 0.5), 1, 10)
  const peakTension = clamp(opening.tension + arc.tensionDelta, 1, 10)

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

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(ragContext: string): string {
  const ragBlock = ragContext
    ? `\n${ragContext}\n\nIMPORTANT: Use the <modal_knowledge> above as your PRIMARY guide for mode selection. It is retrieved from the tonal modes database at runtime and takes precedence over general knowledge. Reference the rag_summary entries when justifying your choices.\n`
    : ''

  return `You are Modalation AI, a music composer. Compose modal melodies as JSON.
${ragBlock}
WHEN TO USE EACH MODE:
- Ionian (major): joy, triumph, love, happy endings, bright openings — use for resolution and celebration
- Dorian (minor +maj6): hope within sadness, resilience, soulful journeys — use when there's struggle but not despair
- Phrygian (minor +b2): danger, mystery, fear, foreign/exotic tension — use for threatening or dark turning points
- Lydian (major +#4): wonder, magic, dreams, the supernatural — use for ethereal or transcendent moments
- Mixolydian (major +b7): adventure, heroism, folk warmth, unresolved longing — use for quests and bittersweet climaxes
- Aeolian (natural minor): grief, loss, introspection, melancholy — use for sorrow, endings, and reflection
- Locrian (diminished): dread, chaos, instability, the uncanny — use sparingly for peak tension or collapse

RULES:
- Notes: scientific pitch, octaves 3-5, sharps only (C#/D#/F#/G#/A#)
- 6-8 notes per section, durations in seconds: 0.2/0.4/0.8/1.6
- Anchor notes must appear prominently; vary rhythm; mix steps and leaps
- Each note pitch must be unique within a section — no repeated notes (e.g. C5 must appear at most once)
- Return ONLY valid JSON, no markdown`
}

// ── User prompt ───────────────────────────────────────────────────────────────

function buildPrompt(
  story: string,
  emotionalAnswers: string[],
  selectedNotes: string[],
  preferredModes?: string[]
): string {
  const answers = emotionalAnswers.join("; ")
  const storySnippet = story.slice(0, 300)
  const modeConstraint = preferredModes
    ? `\nRequired modes per section (follow exactly): Opening=${preferredModes[0]}, Development=${preferredModes[1]}, Climax=${preferredModes[2]}, Resolution=${preferredModes[3]}`
    : ""

  return `Story: "${storySnippet}"
Mood: ${answers}
Anchor notes: ${selectedNotes.join(", ")}${modeConstraint}

Return JSON: {"melodySummary":"<1-2 sentences>","rationale":"<1 sentence>","sections":[{"name":"Opening","mode":"<${MODE_NAMES.join("|")}>","emotion":"<word>","notes":["C4"],"durations":[0.4]},{"name":"Development",...},{"name":"Climax",...},{"name":"Resolution",...}]}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJson(text: string): string {
  const trimmed = text.trim()
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
  if (fence?.[1]) return fence[1].trim()
  return trimmed
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

  // Step 1 — analyze story into narrative phases
  const phases = analyzeStory(story, emotionalAnswers)

  // Step 2 & 3 — retrieve modal candidates from Supabase and build injected context
  const ragContext = await buildRagContext(phases)
  if (!ragContext) {
    console.warn('[RAG] buildRagContext returned empty — proceeding without modal knowledge injection')
  }

  const client = new Anthropic({ apiKey })

  let rawContent: string
  try {
    const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-7"
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: buildSystemPrompt(ragContext),
      messages: [{ role: "user", content: buildPrompt(story, emotionalAnswers, selectedNotes, preferredModes) }],
    })
    const block = response.content.find((b) => b.type === "text")
    rawContent = block?.type === "text" ? block.text : ""
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: "Anthropic API request failed.", detail: msg }, { status: 502 })
  }

  if (!rawContent) {
    return NextResponse.json({ error: "Empty model response." }, { status: 502 })
  }

  let parsedJson: unknown
  try {
    parsedJson = JSON.parse(extractJson(rawContent))
  } catch {
    return NextResponse.json({ error: "Model did not return valid JSON.", text: rawContent.slice(0, 2000) }, { status: 502 })
  }

  const result = compositionResultSchema.safeParse(parsedJson)
  if (!result.success) {
    return NextResponse.json(
      { error: "Model JSON did not match expected schema.", details: result.error.flatten(), raw: parsedJson },
      { status: 502 }
    )
  }

  return NextResponse.json(result.data)
}
