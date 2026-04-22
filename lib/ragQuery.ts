import { supabase } from './supabase'

// ── Supabase return shape ────────────────────────────────────────────────────

export interface TonalMode {
  id: number
  mode_number: string
  name: string
  subtitle: string
  formula: string
  semitone_pattern: string
  notes_from_c: string
  mood_keywords: string[]
  story_emotions: string[]
  narrative_phases: string[]
  story_themes: string[]
  brightness_level: number
  historical_context: string
  scale_construction: string
  harmonic_environment: string
  characteristic_sound: string
  composition_tips: string
  famous_examples: string
  genres: string[]
  rag_summary: string
  created_at: string
}

// ── Analyzed phase shape (produced by story analysis in the API route) ───────

export interface AnalyzedPhase {
  name: string
  emotionKeywords: string[]
  phaseDescription: string
  tensionLevel: number    // 1–10
  brightnessLevel: number // 1–10
}

// ── Query functions ──────────────────────────────────────────────────────────

export async function getModesForEmotion(keywords: string[]): Promise<TonalMode[]> {
  try {
    const { data, error } = await supabase.rpc('get_modes_by_emotion', {
      emotion_keywords: keywords,
    })
    if (error) throw error
    return (data as TonalMode[]) ?? []
  } catch (err) {
    console.error('[RAG] getModesForEmotion failed:', err)
    return []
  }
}

export async function getModesForPhase(phase: string): Promise<TonalMode[]> {
  try {
    const { data, error } = await supabase.rpc('get_modes_by_phase', { phase })
    if (error) throw error
    return (data as TonalMode[]) ?? []
  } catch (err) {
    console.error('[RAG] getModesForPhase failed:', err)
    return []
  }
}

export async function getModesForMoodRange(
  minTension: number,
  maxTension: number,
  minBrightness: number,
  maxBrightness: number
): Promise<TonalMode[]> {
  try {
    const { data, error } = await supabase.rpc('get_modes_by_mood_range', {
      min_tension: minTension,
      max_tension: maxTension,
      min_brightness: minBrightness,
      max_brightness: maxBrightness,
    })
    if (error) throw error
    return (data as TonalMode[]) ?? []
  } catch (err) {
    console.error('[RAG] getModesForMoodRange failed:', err)
    return []
  }
}

// ── Context builder ───────────────────────────────────────────────────────────

export async function buildRagContext(phases: AnalyzedPhase[]): Promise<string> {
  const sections: string[] = []

  for (const phase of phases) {
    const seen = new Set<number>()
    const modes: TonalMode[] = []

    // Primary retrieval: by emotion keywords
    const emotionResults = await getModesForEmotion(phase.emotionKeywords)
    for (const m of emotionResults) {
      if (!seen.has(m.id)) { seen.add(m.id); modes.push(m) }
    }

    // Fallback: broaden by tension/brightness range when primary yields < 2
    if (modes.length < 2) {
      const rangeResults = await getModesForMoodRange(
        Math.max(1, phase.tensionLevel - 2),
        Math.min(10, phase.tensionLevel + 2),
        Math.max(1, phase.brightnessLevel - 2),
        Math.min(10, phase.brightnessLevel + 2)
      )
      for (const m of rangeResults) {
        if (!seen.has(m.id)) { seen.add(m.id); modes.push(m) }
      }
    }

    if (modes.length > 0) {
      const summaries = modes.map(m => `  - ${m.rag_summary}`).join('\n')
      sections.push(`${phase.name.toUpperCase()} ("${phase.phaseDescription}"):\n${summaries}`)
    }
  }

  if (sections.length === 0) return ''

  return [
    '<modal_knowledge>',
    'Retrieved from tonal modes database — use these summaries as your primary guide for mode selection:',
    '',
    sections.join('\n\n'),
    '</modal_knowledge>',
  ].join('\n')
}
