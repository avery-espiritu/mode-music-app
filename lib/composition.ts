import { z } from "zod"

export const MODE_NAMES = [
  "Ionian",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Aeolian",
  "Locrian",
] as const

export type ModeName = (typeof MODE_NAMES)[number]

export const compositionSectionSchema = z.object({
  name: z.string().min(1),
  mode: z.enum(MODE_NAMES),
  emotion: z.string().min(1),
  notes: z.array(z.string()).min(4),
  durations: z.array(z.number().positive()).min(4),
  bassNotes: z.array(z.string()).min(2),
  bassDurations: z.array(z.number().positive()).min(2),
})

export const compositionResultSchema = z.object({
  melodySummary: z.string().min(1),
  sections: z.array(compositionSectionSchema).length(4),
  rationale: z.string().optional(),
})

export type CompositionSection = z.infer<typeof compositionSectionSchema>
export type CompositionResult = z.infer<typeof compositionResultSchema>
