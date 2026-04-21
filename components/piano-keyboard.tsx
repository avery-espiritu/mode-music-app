"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { playSequence as audioPlaySequence, startAudio, type NoteEvent } from "@/lib/audio"

export type { NoteEvent }

// 2 octaves: C3–B4
const OCTAVES = [3, 4] as const
const WHITE_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const
const BLACK_SLOTS: Record<string, string> = {
  C: "C#", D: "D#", F: "F#", G: "G#", A: "A#",
}

const WHITE_KEYS: { note: string; octave: number }[] = OCTAVES.flatMap((oct) =>
  WHITE_NAMES.map((name) => ({ note: name, octave: oct }))
)

const BLACK_KEYS: { note: string; whiteIndex: number }[] = []
WHITE_KEYS.forEach(({ note, octave }, i) => {
  if (note in BLACK_SLOTS) {
    BLACK_KEYS.push({ note: `${BLACK_SLOTS[note]}${octave}`, whiteIndex: i })
  }
})

const WHITE_KEY_W = 44
const BLACK_KEY_W = 28
const WHITE_KEY_H = 160
const BLACK_KEY_H = 100

interface PianoKeyboardProps {
  onNotePlay?: (note: string) => void
  selectedNotes?: string[]
  className?: string
}

export function PianoKeyboard({ onNotePlay, selectedNotes = [], className }: PianoKeyboardProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const stopHandleRef = useRef<{ stop: () => void } | null>(null)

  // Derived baseline from selected notes — updates whenever selection changes
  const notesKey = selectedNotes.join(",")
  const derivedInput = selectedNotes.map(n => `${n}:0.4`).join(", ")

  // Manual override: user typed something different; cleared when selection changes
  const [manualInput, setManualInput] = useState<string | null>(null)
  const prevNotesKey = useRef(notesKey)
  useEffect(() => {
    if (prevNotesKey.current !== notesKey) {
      prevNotesKey.current = notesKey
      setManualInput(null)
    }
  }, [notesKey])

  const displayInput = manualInput ?? derivedInput

  // Derive sequence and error purely — no setState during render
  const { sequence, parseError } = useMemo(() => {
    const parts = displayInput.split(",").map(s => s.trim()).filter(Boolean)
    const events: NoteEvent[] = []
    for (const part of parts) {
      const [noteStr, durStr] = part.split(":").map(s => s.trim())
      if (!noteStr) return { sequence: [], parseError: `Invalid entry: "${part}"` }
      const duration = durStr ? parseFloat(durStr) : 0.4
      if (isNaN(duration) || duration <= 0) return { sequence: [], parseError: `Bad duration in: "${part}"` }
      events.push({ note: noteStr, duration })
    }
    return { sequence: events, parseError: null }
  }, [displayInput])

  const flashNote = useCallback((note: string, durationMs: number) => {
    setActiveNotes((prev) => new Set([...prev, note]))
    setTimeout(() => {
      setActiveNotes((prev) => { const n = new Set(prev); n.delete(note); return n })
    }, durationMs)
  }, [])

  const playNote = useCallback(async (noteStr: string, durationSec = 0.5) => {
    const synth = await startAudio()
    synth.triggerAttackRelease(noteStr, durationSec)
    flashNote(noteStr, durationSec * 1000)
    onNotePlay?.(noteStr)
  }, [flashNote, onNotePlay])

  const handlePlaySequence = useCallback(() => {
    if (isPlaying) return
    setIsPlaying(true)
    stopHandleRef.current = audioPlaySequence(
      sequence,
      (note) => flashNote(note, sequence.find((e) => e.note === note)?.duration ?? 0.4 * 1000),
      () => setIsPlaying(false),
    )
  }, [isPlaying, sequence, flashNote])

  const handleStop = useCallback(() => {
    stopHandleRef.current?.stop()
    stopHandleRef.current = null
    setIsPlaying(false)
    setActiveNotes(new Set())
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Keyboard */}
      <div
        className="relative mx-auto select-none"
        style={{ width: WHITE_KEY_W * WHITE_KEYS.length, height: WHITE_KEY_H }}
      >
        {WHITE_KEYS.map(({ note, octave }, i) => {
          const id = `${note}${octave}`
          const isActive = activeNotes.has(id)
          const isSelected = selectedNotes.includes(id)
          return (
            <button
              key={id}
              onPointerDown={() => playNote(id)}
              className={cn(
                "absolute top-0 border border-border rounded-b-md transition-colors duration-75 z-0",
                isActive ? "bg-primary" : isSelected ? "bg-primary/30 hover:bg-primary/40" : "bg-white hover:bg-primary/20 active:bg-primary/40"
              )}
              style={{ left: i * WHITE_KEY_W, width: WHITE_KEY_W - 2, height: WHITE_KEY_H }}
            >
              <span className={cn(
                "absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium pointer-events-none",
                isActive || isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {id}
              </span>
            </button>
          )
        })}

        {BLACK_KEYS.map(({ note, whiteIndex }) => {
          const isActive = activeNotes.has(note)
          const isSelected = selectedNotes.includes(note)
          return (
            <button
              key={note}
              onPointerDown={(e) => { e.stopPropagation(); playNote(note, 0.4) }}
              className={cn(
                "absolute top-0 rounded-b-md z-10 transition-colors duration-75",
                isActive ? "bg-primary" : isSelected ? "bg-primary/70 hover:bg-primary/80" : "bg-zinc-900 hover:bg-zinc-700 active:bg-primary"
              )}
              style={{
                left: whiteIndex * WHITE_KEY_W + WHITE_KEY_W - BLACK_KEY_W / 2,
                width: BLACK_KEY_W,
                height: BLACK_KEY_H,
              }}
            >
              <span className={cn(
                "absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium pointer-events-none",
                isActive ? "text-primary-foreground" : "text-zinc-400"
              )}>
                {note.replace(/\d/, "")}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sequence Player */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Sequence Player</p>
        <p className="text-xs text-muted-foreground">
          Format: <code className="bg-secondary px-1 rounded">NOTE:duration</code> pairs separated by commas (duration in seconds).
          Example: <code className="bg-secondary px-1 rounded">C4:0.4, E4:0.4, G4:0.8</code>
        </p>
        <textarea
          value={displayInput}
          onChange={(e) => setManualInput(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-secondary p-2 text-sm font-mono text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Select notes above to populate, or type manually: C4:0.4, E4:0.4"
        />
        {parseError && <p className="text-xs text-destructive">{parseError}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handlePlaySequence}
            disabled={isPlaying || sequence.length === 0 || !!parseError}
            className="gap-1"
          >
            <Play className="w-3 h-3" />
            Play Sequence
          </Button>
          {isPlaying && (
            <Button size="sm" variant="outline" onClick={handleStop} className="gap-1">
              <Square className="w-3 h-3" />
              Stop
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
