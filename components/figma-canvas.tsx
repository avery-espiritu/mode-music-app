"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Music, MessageSquare, Keyboard, Sparkles, Volume2, GripVertical, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CompositionResult } from "@/lib/composition"
import { MODE_NAMES } from "@/lib/composition"
import { EMOTIONAL_QUESTIONS } from "@/lib/emotional-questions"
import { PianoKeyboard } from "@/components/piano-keyboard"
import { playSequence, playWithBass } from "@/lib/audio"

interface FigmaCanvasProps {
  currentScreen: number
  onNavigate: (screen: number) => void
  story: string
  onStoryChange: (value: string) => void
  emotionalAnswers: string[]
  onEmotionalAnswersChange: (answers: string[]) => void
  selectedNotes: string[]
  onSelectedNotesChange: (notes: string[]) => void
  composition: CompositionResult | null
  compositionError: string | null
  onGenerateComposition: () => Promise<void>
  onRegenerate: (story: string, modes: string[]) => Promise<void>
  onResetJourney: () => void
}

const screens = [
  { id: 0, name: "Welcome", icon: Music },
  { id: 1, name: "Story Input", icon: MessageSquare },
  { id: 2, name: "AI Questions", icon: Sparkles },
  { id: 3, name: "Keyboard", icon: Keyboard },
  { id: 4, name: "Generation", icon: Sparkles },
  { id: 5, name: "Playback", icon: Volume2 },
]

export function FigmaCanvas({
  currentScreen,
  onNavigate,
  story,
  onStoryChange,
  emotionalAnswers,
  onEmotionalAnswersChange,
  selectedNotes,
  onSelectedNotesChange,
  composition,
  compositionError,
  onGenerateComposition,
  onRegenerate,
  onResetJourney,
}: FigmaCanvasProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Liquid glass container */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_48px_rgba(0,0,0,0.5)] ring-1 ring-white/5 overflow-hidden">
          <ScreenContent
            screen={currentScreen}
            onNavigate={onNavigate}
            story={story}
            onStoryChange={onStoryChange}
            emotionalAnswers={emotionalAnswers}
            onEmotionalAnswersChange={onEmotionalAnswersChange}
            selectedNotes={selectedNotes}
            onSelectedNotesChange={onSelectedNotesChange}
            composition={composition}
            compositionError={compositionError}
            onGenerateComposition={onGenerateComposition}
            onRegenerate={onRegenerate}
            onResetJourney={onResetJourney}
          />
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => onNavigate(screen.id)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentScreen === screen.id
                  ? "bg-white/80 w-6"
                  : "bg-white/20 w-1.5 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ScreenContent({
  screen,
  onNavigate,
  story,
  onStoryChange,
  emotionalAnswers,
  onEmotionalAnswersChange,
  selectedNotes,
  onSelectedNotesChange,
  composition,
  compositionError,
  onGenerateComposition,
  onRegenerate,
  onResetJourney,
}: {
  screen: number
  onNavigate: (s: number) => void
  story: string
  onStoryChange: (value: string) => void
  emotionalAnswers: string[]
  onEmotionalAnswersChange: (answers: string[]) => void
  selectedNotes: string[]
  onSelectedNotesChange: (notes: string[]) => void
  composition: CompositionResult | null
  compositionError: string | null
  onGenerateComposition: () => Promise<void>
  onRegenerate: (story: string, modes: string[]) => Promise<void>
  onResetJourney: () => void
}) {
  switch (screen) {
    case 0:
      return <WelcomeScreen onNavigate={onNavigate} />
    case 1:
      return <StoryInputScreen story={story} onStoryChange={onStoryChange} onNavigate={onNavigate} />
    case 2:
      return (
        <AIQuestionsScreen
          emotionalAnswers={emotionalAnswers}
          onEmotionalAnswersChange={onEmotionalAnswersChange}
          onNavigate={onNavigate}
        />
      )
    case 3:
      return (
        <KeyboardScreen
          selectedNotes={selectedNotes}
          onSelectedNotesChange={onSelectedNotesChange}
          onNavigate={onNavigate}
        />
      )
    case 4:
      return (
        <GenerationScreen
          onNavigate={onNavigate}
          compositionError={compositionError}
          onGenerateComposition={onGenerateComposition}
        />
      )
    case 5:
      return (
        <PlaybackScreen
          onNavigate={onNavigate}
          story={story}
          composition={composition}
          onRegenerate={onRegenerate}
          onResetJourney={onResetJourney}
        />
      )
    default:
      return null
  }
}

// Screen 1: Welcome
function WelcomeScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Music className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Modalation
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Discover how musical modes shape the emotional landscape of your stories. 
            No music theory required.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate(1)}
            className="w-full py-4 px-8 bg-primary text-primary-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-opacity"
          >
            Start Your Journey
          </button>
          <p className="text-sm text-muted-foreground">
            Takes about 5 minutes
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">7</p>
            <p className="text-xs text-muted-foreground">Modes</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">AI</p>
            <p className="text-xs text-muted-foreground">Powered</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">Interactive</p>
            <p className="text-xs text-muted-foreground">Experience</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Screen 2: Story Input
function StoryInputScreen({
  story,
  onStoryChange,
  onNavigate,
}: {
  story: string
  onStoryChange: (value: string) => void
  onNavigate: (s: number) => void
}) {
  return (
    <div className="min-h-[600px] flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(0)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Step 1 of 4</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Share your story</h2>
          <p className="text-muted-foreground">
            Write a short story, poem, or scene. We&apos;ll compose music that matches its emotional journey.
          </p>
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            value={story}
            onChange={(e) => onStoryChange(e.target.value)}
            placeholder="Once upon a time, in a quiet village nestled between mountains..."
            className="flex-1 min-h-[200px] w-full p-4 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>{story.length} characters</span>
            <span>Ideal: 100-500 characters</span>
          </div>
        </div>

        {/* Example prompts */}
        <div className="mt-6 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {["A hero&apos;s journey", "A love story", "A mystery unfolds"].map((example) => (
              <button
                key={example}
                onClick={() =>
                  onStoryChange(
                    example === "A hero&apos;s journey"
                      ? "A young warrior leaves their peaceful village to face the darkness that threatens the land. Through trials and loss, they discover inner strength they never knew existed."
                      : example === "A love story"
                        ? "Two strangers meet on a rainy evening. What begins as a chance encounter blossoms into something neither expected, changing their lives forever."
                        : "The old mansion held secrets. As Sarah explored the dusty rooms, she found a letter that would unravel everything she thought she knew.",
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                {example.replace("&apos;", "'")}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate(2)}
          disabled={story.length < 20}
          className={cn(
            "mt-6 w-full py-4 rounded-xl font-medium transition-all",
            story.length >= 20
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// Screen 3: AI Questions
function AIQuestionsScreen({
  emotionalAnswers,
  onEmotionalAnswersChange,
  onNavigate,
}: {
  emotionalAnswers: string[]
  onEmotionalAnswersChange: (answers: string[]) => void
  onNavigate: (s: number) => void
}) {
  const questions = EMOTIONAL_QUESTIONS
  const currentIndex = Math.min(emotionalAnswers.length, questions.length - 1)
  const isComplete = emotionalAnswers.length >= questions.length

  const handleAnswer = (answer: string) => {
    if (emotionalAnswers.length >= questions.length) return
    onEmotionalAnswersChange([...emotionalAnswers, answer])
  }

  return (
    <div className="min-h-[600px] flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Step 2 of 4</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full">
        {/* AI Avatar */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Modalation AI</p>
            <div className="bg-white/10 rounded-xl rounded-tl-none p-4">
              <p className="text-foreground">
                {!isComplete
                  ? questions[currentIndex].question
                  : "Perfect! I have a great sense of your story's emotional arc now."}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Question {Math.min(emotionalAnswers.length + 1, questions.length)} of {questions.length}</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${(isComplete ? 100 : (emotionalAnswers.length / questions.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Options or Complete */}
        {!isComplete ? (
          <div className="space-y-3">
            {questions[currentIndex].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-foreground text-left hover:border-primary/50 hover:bg-white/10 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-primary font-medium">Emotional journey mapped!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your story moves through {emotionalAnswers.length} distinct emotional phases.
              </p>
            </div>
            <button
              onClick={() => onNavigate(3)}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Choose Your Notes
            </button>
          </div>
        )}

        {/* Previous answers */}
        {emotionalAnswers.length > 0 && !isComplete && (
          <div className="mt-8 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Your answers:</p>
            <div className="flex flex-wrap gap-2">
              {emotionalAnswers.map((answer, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {answer}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Screen 4: Keyboard Selection
function KeyboardScreen({
  selectedNotes,
  onSelectedNotesChange,
  onNavigate,
}: {
  selectedNotes: string[]
  onSelectedNotesChange: (notes: string[]) => void
  onNavigate: (s: number) => void
}) {
  const handleNotePlay = (note: string) => {
    if (selectedNotes.includes(note)) {
      onSelectedNotesChange(selectedNotes.filter((n) => n !== note))
    } else if (selectedNotes.length < 3) {
      onSelectedNotesChange([...selectedNotes, note])
    }
  }

  return (
    <div className="min-h-[600px] flex flex-col p-8 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(2)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Step 3 of 4</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col w-full">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Play & Choose 3 notes</h2>
          <p className="text-muted-foreground">
            Click keys to hear them. The first 3 you play will be selected for your story.
          </p>
        </div>

        {/* Selected notes display */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xl font-semibold transition-all",
                selectedNotes[i]
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 text-muted-foreground"
              )}
            >
              {selectedNotes[i] || "?"}
            </div>
          ))}
          <p className="text-sm text-muted-foreground ml-4">
            {3 - selectedNotes.length} remaining
          </p>
        </div>

        {/* Real 2-octave piano + sequence player */}
        <PianoKeyboard onNotePlay={handleNotePlay} selectedNotes={selectedNotes} className="mb-6" />

        <button
          onClick={() => onNavigate(4)}
          disabled={selectedNotes.length !== 3}
          className={cn(
            "w-full py-4 rounded-xl font-medium transition-all",
            selectedNotes.length === 3
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Generate My Melody
        </button>
      </div>
    </div>
  )
}

const GENERATION_STAGES = [
  { name: "Analyzing emotional arc", threshold: 25 },
  { name: "Selecting modal scales", threshold: 50 },
  { name: "Composing melody", threshold: 75 },
  { name: "Finalizing arrangement", threshold: 100 },
] as const

// Screen 5: Generation Loading
function GenerationScreen({
  onNavigate,
  compositionError,
  onGenerateComposition,
}: {
  onNavigate: (s: number) => void
  compositionError: string | null
  onGenerateComposition: () => Promise<void>
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    let cancelled = false

    const tick = () => {
      setProgress((p) => (p < 92 ? p + 2 : p))
    }

    const run = async () => {
      setProgress(4)
      interval = setInterval(tick, 120)
      try {
        await onGenerateComposition()
        if (!cancelled) {
          setProgress(100)
        }
      } catch {
        if (!cancelled) setProgress(0)
      } finally {
        if (interval) clearInterval(interval)
      }
    }

    run()

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [onGenerateComposition])

  const stageIdx = GENERATION_STAGES.findIndex((s) => progress < s.threshold)
  const stageLabel = GENERATION_STAGES[stageIdx === -1 ? GENERATION_STAGES.length - 1 : stageIdx].name

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div
            className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
            style={{ animationDuration: "1.5s" }}
          />
          <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Creating your melody</h2>
          <p className="text-muted-foreground">
            {compositionError ? "Something went wrong while consulting the AI." : `${stageLabel}...`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </div>

        {compositionError ? (
          <div className="space-y-3 text-left">
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-foreground">
              {compositionError}
            </div>
            <Button
              className="w-full"
              onClick={async () => {
                setProgress(4)
                try {
                  await onGenerateComposition()
                  setProgress(100)
                } catch {
                  setProgress(0)
                }
              }}
            >
              Try again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => onNavigate(3)}>
              Back to notes
            </Button>
          </div>
        ) : (
          <>
            {progress >= 100 && (
              <button
                onClick={() => onNavigate(5)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Listen to Your Story
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const PLAYBACK_SECTION_COLORS = ["bg-chart-4", "bg-chart-2", "bg-chart-1", "bg-chart-3"] as const

const FALLBACK_PLAYBACK_SECTIONS = [
  { name: "Opening", mode: "Dorian", emotion: "Mysterious" },
  { name: "Rising Action", mode: "Mixolydian", emotion: "Building tension" },
  { name: "Climax", mode: "Ionian", emotion: "Triumphant" },
  { name: "Resolution", mode: "Aeolian", emotion: "Reflective" },
]

// Screen 6: Playback
function PlaybackScreen({
  onNavigate,
  story,
  composition,
  onRegenerate,
  onResetJourney,
}: {
  onNavigate: (s: number) => void
  story: string
  composition: CompositionResult | null
  onRegenerate: (story: string, modes: string[]) => Promise<void>
  onResetJourney: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const stopHandleRef = useRef<{ stop: () => void } | null>(null)

  // ── Edit & Explore state ─────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false)
  const [editedStory, setEditedStory] = useState(story)
  const [editedSections, setEditedSections] = useState<{ name: string; mode: string }[]>([])
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)

  const openEditor = () => {
    const src = composition?.sections ?? FALLBACK_PLAYBACK_SECTIONS
    setEditedSections(src.map(s => ({ name: s.name, mode: s.mode })))
    setEditedStory(story)
    setRegenerateError(null)
    setIsEditing(true)
  }

  const reorderSections = (from: number, to: number) => {
    const arr = [...editedSections]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    setEditedSections(arr)
    setDragIdx(null)
    setDropIdx(null)
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    setRegenerateError(null)
    try {
      await onRegenerate(editedStory, editedSections.map(s => s.mode))
      setIsEditing(false)
      setCurrentSection(0)
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : "Regeneration failed.")
    } finally {
      setIsRegenerating(false)
    }
  }

  // ── Playback logic ───────────────────────────────────────────────────────
  const sections = (composition?.sections ?? FALLBACK_PLAYBACK_SECTIONS).map((section, i) => ({
    ...section,
    color: PLAYBACK_SECTION_COLORS[i % PLAYBACK_SECTION_COLORS.length],
  }))

  const modeLegend = composition
    ? Array.from(new Set(composition.sections.map((s) => s.mode)))
    : (["Ionian", "Dorian", "Aeolian", "Mixolydian"] as const)

  const currentSectionData = sections[currentSection]
  const hasNotes = "notes" in currentSectionData && Array.isArray(currentSectionData.notes) && currentSectionData.notes.length > 0

  const handlePlay = useCallback(() => {
    if (isPlaying || !hasNotes) return
    const sec = currentSectionData as unknown as { notes: string[]; durations: number[]; bassNotes?: string[]; bassDurations?: number[] }
    const melodyEvents = sec.notes.map((note, i) => ({ note, duration: sec.durations[i] ?? 0.4 }))
    const bassEvents = (sec.bassNotes ?? []).map((note, i) => ({ note, duration: sec.bassDurations?.[i] ?? 1.6 }))
    setIsPlaying(true)
    stopHandleRef.current = playWithBass(
      melodyEvents,
      bassEvents,
      (note) => {
        setActiveNote(note)
        const dur = melodyEvents.find((e) => e.note === note)?.duration ?? 0.4
        setTimeout(() => setActiveNote(null), dur * 1000)
      },
      () => { setIsPlaying(false); setActiveNote(null) },
    )
  }, [isPlaying, hasNotes, currentSectionData])

  const handleStop = useCallback(() => {
    stopHandleRef.current?.stop()
    stopHandleRef.current = null
    setIsPlaying(false)
    setActiveNote(null)
  }, [])

  const handlePlayAll = useCallback(() => {
    if (isPlaying || !composition) return
    const allMelody = composition.sections.flatMap((sec, si) =>
      sec.notes.map((note, i) => ({ note, duration: sec.durations[i] ?? 0.4, sectionIdx: si }))
    )
    const allBass = composition.sections.flatMap((sec) =>
      sec.bassNotes.map((note, i) => ({ note, duration: sec.bassDurations[i] ?? 1.6 }))
    )
    setIsPlaying(true)
    let noteCount = 0
    const sectionSizes = composition.sections.map((s) => s.notes.length)
    stopHandleRef.current = playWithBass(
      allMelody,
      allBass,
      (note) => {
        setActiveNote(note)
        const dur = allMelody[noteCount]?.duration ?? 0.4
        noteCount++
        let acc = 0
        for (let i = 0; i < sectionSizes.length; i++) {
          acc += sectionSizes[i]
          if (noteCount <= acc) { setCurrentSection(i); break }
        }
        setTimeout(() => setActiveNote(null), dur * 1000)
      },
      () => { setIsPlaying(false); setActiveNote(null) },
    )
  }, [isPlaying, composition])

  useEffect(() => {
    return () => { stopHandleRef.current?.stop() }
  }, [])

  return (
    <div className="min-h-[600px] flex flex-col p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(0)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Your Composition</span>
        <button
          onClick={isEditing ? () => setIsEditing(false) : openEditor}
          disabled={isPlaying}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          {isEditing ? "Close" : "Edit"}
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full">

        {/* ── Edit & Explore panel ─────────────────────────────────────── */}
        {isEditing && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Story</p>
              <textarea
                value={editedStory}
                onChange={e => setEditedStory(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Section Modes</p>
              <p className="text-xs text-muted-foreground mb-3">Drag to reorder · Change mode for each section</p>
              <div className="space-y-2">
                {editedSections.map((section, i) => (
                  <div
                    key={`${section.name}-${i}`}
                    draggable
                    onDragStart={() => setDragIdx(i)}
                    onDragOver={e => { e.preventDefault(); setDropIdx(i) }}
                    onDrop={() => dragIdx !== null && reorderSections(dragIdx, i)}
                    onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none",
                      dropIdx === i && dragIdx !== i
                        ? "border-primary/60 bg-primary/10"
                        : dragIdx === i
                          ? "border-white/20 bg-white/10 opacity-60"
                          : "border-white/10 bg-white/5 hover:bg-white/8"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground w-24 flex-shrink-0">{section.name}</span>
                    <div className="flex-1 relative">
                      <select
                        value={section.mode}
                        onChange={e => setEditedSections(prev =>
                          prev.map((s, j) => j === i ? { ...s, mode: e.target.value } : s)
                        )}
                        className="w-full bg-black/30 text-foreground text-sm border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
                      >
                        {MODE_NAMES.map(m => (
                          <option key={m} value={m} className="bg-zinc-900 text-white">{m}</option>
                        ))}
                      </select>
                      <ChevronRight className="w-3 h-3 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {regenerateError && (
              <p className="text-xs text-destructive">{regenerateError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isRegenerating}
                className="flex-1 py-3 rounded-xl border border-white/10 text-foreground text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || editedStory.trim().length < 10}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isRegenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Generating…
                  </span>
                ) : "Regenerate Melody"}
              </button>
            </div>
          </div>
        )}

        {/* ── Active note display ──────────────────────────────────────── */}
        <div className="h-24 rounded-xl bg-white/5 border border-white/10 mb-6 flex items-center justify-center overflow-hidden relative">
          {isRegenerating ? (
            <div className="flex flex-col items-center gap-2">
              <span className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Composing new melody…</span>
            </div>
          ) : isPlaying ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-bold text-primary transition-all duration-75">
                {activeNote ?? "♩"}
              </span>
              <span className="text-xs text-muted-foreground">now playing</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {hasNotes ? "Press play to hear your melody" : "No melody data — generate a composition first"}
            </p>
          )}
        </div>

        {/* Section tabs */}
        <div className="mb-6">
          <div className="flex gap-1 mb-3">
            {sections.map((section, i) => (
              <button
                key={section.name}
                onClick={() => { if (!isPlaying) setCurrentSection(i) }}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all",
                  i === currentSection ? section.color : "bg-muted hover:bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{currentSectionData.name}</p>
              <p className="text-sm text-muted-foreground">{currentSectionData.emotion}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">{currentSectionData.mode} Mode</p>
              {hasNotes && (
                <p className="text-xs text-muted-foreground">
                  {(currentSectionData as unknown as { notes: string[] }).notes.length} notes
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Note sequence preview */}
        {hasNotes && (() => {
          const NOTE_ORDER = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
          const sec = currentSectionData as unknown as { notes: string[]; bassNotes?: string[] }
          const scaleNotes = [...new Set(sec.notes)].sort((a, b) => {
            const octA = parseInt(a.slice(-1)), octB = parseInt(b.slice(-1))
            if (octA !== octB) return octA - octB
            return NOTE_ORDER.indexOf(a.slice(0, -1)) - NOTE_ORDER.indexOf(b.slice(0, -1))
          })
          const bassNotes = sec.bassNotes ?? []
          return (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4 overflow-x-auto space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Melody</p>
                <div className="flex gap-1.5 flex-wrap">
                  {scaleNotes.map((note) => (
                    <span
                      key={note}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-mono transition-colors",
                        activeNote === note
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              {bassNotes.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Bass</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[...new Set(bassNotes)].map((note) => (
                      <span key={note} className="px-2 py-0.5 rounded text-xs font-mono bg-secondary/60 text-muted-foreground/70">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {composition && (
          <div className="p-4 rounded-xl border border-primary/15 bg-primary/5 mb-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">AI melody direction</p>
            <p className="text-sm text-foreground leading-relaxed">{composition.melodySummary}</p>
            {composition.rationale && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{composition.rationale}</p>
            )}
          </div>
        )}

        {/* Story text */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
          <p className="text-foreground leading-relaxed text-sm">
            {story.trim().length > 0
              ? <>&ldquo;{story.trim()}&rdquo;</>
              : <span className="text-muted-foreground">Your story will appear here.</span>
            }
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => { if (!isPlaying) setCurrentSection(Math.max(0, currentSection - 1)) }}
            disabled={isPlaying || currentSection === 0}
            className="p-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={isPlaying ? handleStop : handlePlay}
            disabled={!hasNotes || isRegenerating}
            className="p-4 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
            title="Play this section"
          >
            {isPlaying ? (
              <div className="w-5 h-5 flex items-center justify-center gap-1">
                <div className="w-1.5 h-4 bg-foreground rounded" />
                <div className="w-1.5 h-4 bg-foreground rounded" />
              </div>
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {composition && (
            <button
              onClick={isPlaying ? handleStop : handlePlayAll}
              disabled={isRegenerating}
              className="px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              title="Play full composition"
            >
              {isPlaying ? "Stop" : "Play All"}
            </button>
          )}

          <button
            onClick={() => { if (!isPlaying) setCurrentSection(Math.min(sections.length - 1, currentSection + 1)) }}
            disabled={isPlaying || currentSection === sections.length - 1}
            className="p-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mode legend */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-sm font-medium text-foreground mb-3">Modes in this composition:</p>
          <div className="flex flex-wrap gap-2">
            {modeLegend.map((mode) => (
              <span key={mode} className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground">
                {mode}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onResetJourney}
          className="mt-6 w-full py-3 rounded-xl border border-white/10 text-foreground font-medium hover:bg-white/10 transition-colors"
        >
          Create Another Story
        </button>
      </div>
    </div>
  )
}
