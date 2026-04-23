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
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.2 },
    }).toDestination()
  }
  return synth
}

function getBassSynth(): Tone.PolySynth {
  if (!bassSynth) {
    bassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 2.0 },
      volume: -8,
    }).toDestination()
  }
  return bassSynth
}

export async function startAudio() {
  await Tone.start()
  return getSynth()
}

export type StopHandle = { stop: () => void }

/**
 * Play a sequence of note events. Returns a handle with a `stop()` method.
 * `onNote` fires each time a note starts (with the note name).
 * `onDone` fires when the sequence ends naturally.
 */
export function playSequence(
  events: NoteEvent[],
  onNote?: (note: string) => void,
  onDone?: () => void,
): StopHandle {
  let cancelled = false

  async function run() {
    const s = await startAudio()
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
      synth?.triggerRelease()
    },
  }
}

/**
 * Play melody and bass sequences simultaneously.
 * Bass runs as an independent loop that repeats for the duration of the melody.
 * `onNote` fires for melody notes only. `onDone` fires when the melody ends.
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
    // Loop the bass pattern for the duration of the melody
    while (!cancelled) {
      for (const { note, duration } of bassEvents) {
        if (cancelled) break
        b.triggerAttackRelease(note, duration * 0.8) // slightly shorter for a punchy feel
        await new Promise<void>((res) => setTimeout(res, duration * 1000))
      }
    }
  }

  runMelody()
  if (bassEvents.length > 0) runBass()

  return {
    stop() {
      cancelled = true
      synth?.triggerRelease()
      bassSynth?.triggerRelease()
    },
  }
}
