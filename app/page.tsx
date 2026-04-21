"use client"

import { useCallback, useState } from "react"
import { FigmaCanvas } from "@/components/figma-canvas"
import type { CompositionResult } from "@/lib/composition"

export default function FigmaMockup() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [story, setStory] = useState("")
  const [emotionalAnswers, setEmotionalAnswers] = useState<string[]>([])
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])
  const [composition, setComposition] = useState<CompositionResult | null>(null)
  const [compositionError, setCompositionError] = useState<string | null>(null)

  const generateComposition = useCallback(async () => {
    setCompositionError(null)
    setComposition(null)

    if (story.trim().length < 1) {
      const msg = "Please write a story before generating."
      setCompositionError(msg); throw new Error(msg)
    }
    if (emotionalAnswers.length < 3) {
      const msg = "Please answer all 3 emotional questions before generating."
      setCompositionError(msg); throw new Error(msg)
    }
    if (selectedNotes.length < 3) {
      const msg = "Please select 3 notes on the keyboard before generating."
      setCompositionError(msg); throw new Error(msg)
    }

    const res = await fetch("/api/composition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story, emotionalAnswers, selectedNotes }),
    })

    const data = (await res.json()) as {
      error?: string
      detail?: string
      details?: unknown
    }

    if (!res.ok) {
      const parts: string[] = []
      if (typeof data.error === "string") parts.push(data.error)
      if (typeof data.detail === "string") parts.push(data.detail)
      if (data.details) parts.push(JSON.stringify(data.details))
      const message = parts.join(" — ") || "Could not generate composition."
      setCompositionError(message)
      throw new Error(message)
    }

    setComposition(data as CompositionResult)
  }, [story, emotionalAnswers, selectedNotes])

  const resetJourney = useCallback(() => {
    setStory("")
    setEmotionalAnswers([])
    setSelectedNotes([])
    setComposition(null)
    setCompositionError(null)
    setCurrentScreen(0)
  }, [])

  return (
    <FigmaCanvas
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      story={story}
      onStoryChange={setStory}
      emotionalAnswers={emotionalAnswers}
      onEmotionalAnswersChange={setEmotionalAnswers}
      selectedNotes={selectedNotes}
      onSelectedNotesChange={setSelectedNotes}
      composition={composition}
      compositionError={compositionError}
      onGenerateComposition={generateComposition}
      onResetJourney={resetJourney}
    />
  )
}
