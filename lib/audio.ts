"use client"

import * as Tone from "tone"

export interface NoteEvent {
  note: string
  duration: number // seconds
}

let synth: Tone.PolySynth | null = null

function getSynth(): Tone.PolySynth {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 1.2 },
    }).toDestination()
  }
  return synth
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
