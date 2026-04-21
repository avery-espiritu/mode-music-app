import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { EMOTIONAL_QUESTIONS } from "@/lib/emotional-questions"
import { compositionResultSchema, MODE_NAMES } from "@/lib/composition"

const requestSchema = z.object({
  story: z.string().min(1),
  emotionalAnswers: z.array(z.string()).length(EMOTIONAL_QUESTIONS.length),
  selectedNotes: z.array(z.string()).length(3),
})

const SYSTEM_PROMPT = `You are Modalation AI, a music composer. Compose modal melodies as JSON.

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

function buildPrompt(story: string, emotionalAnswers: string[], selectedNotes: string[]): string {
  const answers = emotionalAnswers.join("; ")
  const storySnippet = story.slice(0, 300)

  return `Story: "${storySnippet}"
Mood: ${answers}
Anchor notes: ${selectedNotes.join(", ")}

Return JSON: {"melodySummary":"<1-2 sentences>","rationale":"<1 sentence>","sections":[{"name":"Opening","mode":"<${MODE_NAMES.join("|")}>","emotion":"<word>","notes":["C4"],"durations":[0.4]},{"name":"Development",...},{"name":"Climax",...},{"name":"Resolution",...}]}`
}

function extractJson(text: string): string {
  const trimmed = text.trim()
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m)
  if (fence?.[1]) return fence[1].trim()
  return trimmed
}

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

  const { story, emotionalAnswers, selectedNotes } = parsed.data
  const client = new Anthropic({ apiKey })

  let rawContent: string
  try {
    const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-7"
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPrompt(story, emotionalAnswers, selectedNotes) }],
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
