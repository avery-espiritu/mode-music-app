"use client"

import * as Tone from "tone"

export interface NoteEvent {
  note: string
  duration: number // seconds
}

let synth: Tone.PolySynth | null = null
let bassSynth: Tone.PolySynth | null = null

function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.3 },
    }).toDestination()
  }
  return synth
}

function getBassSynth(): Tone.PolySynth {
  if (!bassSynth) {
    bassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.08, decay: 0.3, sustain: 0.5, release: 1.0 },
      volume: -14,
    }).toDestination()
  }
  return bassSynth
}

export async function startAudio(): Promise<Tone.PolySynth> {
  await Tone.start()
  return getSynth()
}

/** Release all active voices on both synths immediately. */
export function releaseAll(): void {
  synth?.releaseAll()
  bassSynth?.releaseAll()
}

/** Release a specific note on the melody synth (for piano key-up events). */
export function releasePianoNote(note: string): void {
  synth?.triggerRelease(note)
}

export type StopHandle = { stop: () => void }

export function playSequence(
  events: NoteEvent[],
  onNote?: (note: string) => void,
  onDone?: () => void,
): StopHandle {
  let cancelled = false

  async function run() {
    const s = await startAudio()
    // Clear any lingering piano notes before the sequence begins
    s.releaseAll()
    for (const { note, duration } of events) {
      if (cancelled) break
      s.triggerAttackRelease(note, duration)
      onNote?.(note)
      await new Promise<void>((res) => setTimeout(res, duration * 1000))
    }
    if (!cancelled) onDone?.()
  }

  run()

  return {
    stop() {
      cancelled = true
      synth?.releaseAll()
    },
  }
}

/**
 * Play melody and bass sequences simultaneously.
 * Bass runs as an independent loop that repeats for the duration of the melody.
 */
export function playWithBass(
  melodyEvents: NoteEvent[],
  bassEvents: NoteEvent[],
  onNote?: (note: string) => void,
  onDone?: () => void,
): StopHandle {
  let cancelled = false

  async function runMelody() {
    const s = await startAudio()
    s.releaseAll()
    for (const { note, duration } of melodyEvents) {
      if (cancelled) break
      s.triggerAttackRelease(note, duration)
      onNote?.(note)
      await new Promise<void>((res) => setTimeout(res, duration * 1000))
    }
    if (!cancelled) onDone?.()
  }

  async function runBass() {
    await Tone.start()
    const b = getBassSynth()
    b.releaseAll()
    for (const { note, duration } of bassEvents) {
      if (cancelled) break
      b.triggerAttackRelease(note, duration * 0.7)
      await new Promise<void>((res) => setTimeout(res, duration * 1000))
    }
  }

  runMelody()
  if (bassEvents.length > 0) runBass()

  return {
    stop() {
      cancelled = true
      synth?.releaseAll()
      bassSynth?.releaseAll()
    },
  }
}
