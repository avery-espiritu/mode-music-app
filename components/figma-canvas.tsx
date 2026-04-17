"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Play, Music, MessageSquare, Keyboard, Sparkles, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FigmaCanvasProps {
  currentScreen: number
  onNavigate: (screen: number) => void
}

const screens = [
  { id: 0, name: "Welcome", icon: Music },
  { id: 1, name: "Story Input", icon: MessageSquare },
  { id: 2, name: "AI Questions", icon: Sparkles },
  { id: 3, name: "Keyboard", icon: Keyboard },
  { id: 4, name: "Generation", icon: Sparkles },
  { id: 5, name: "Playback", icon: Volume2 },
]

export function FigmaCanvas({ currentScreen, onNavigate }: FigmaCanvasProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Figma-style Top Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Music className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Modescape</span>
          </div>
          <span className="text-muted-foreground text-sm">/ Prototype</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Share
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Play className="w-3 h-3 mr-1" />
            Present
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Sidebar - Screens */}
        <aside className="w-64 border-r border-border bg-card/50 p-4 hidden lg:block">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Screens
          </h3>
          <div className="space-y-2">
            {screens.map((screen) => (
              <button
                key={screen.id}
                onClick={() => onNavigate(screen.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  currentScreen === screen.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <screen.icon className="w-4 h-4" />
                <span>{screen.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 bg-background p-4 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Screen Preview */}
            <div className="bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
              <ScreenContent screen={currentScreen} onNavigate={onNavigate} />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate(Math.max(0, currentScreen - 1))}
                disabled={currentScreen === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                {screens.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => onNavigate(screen.id)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentScreen === screen.id
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate(Math.min(screens.length - 1, currentScreen + 1))}
                disabled={currentScreen === screens.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Screen Info */}
            <p className="text-center text-sm text-muted-foreground mt-4">
              Screen {currentScreen + 1} of {screens.length}: {screens[currentScreen].name}
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

function ScreenContent({ screen, onNavigate }: { screen: number; onNavigate: (s: number) => void }) {
  switch (screen) {
    case 0:
      return <WelcomeScreen onNavigate={onNavigate} />
    case 1:
      return <StoryInputScreen onNavigate={onNavigate} />
    case 2:
      return <AIQuestionsScreen onNavigate={onNavigate} />
    case 3:
      return <KeyboardScreen onNavigate={onNavigate} />
    case 4:
      return <GenerationScreen onNavigate={onNavigate} />
    case 5:
      return <PlaybackScreen onNavigate={onNavigate} />
    default:
      return null
  }
}

// Screen 1: Welcome
function WelcomeScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-card to-background relative overflow-hidden">
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
            Modescape
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
function StoryInputScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  const [story, setStory] = useState("")

  return (
    <div className="min-h-[600px] flex flex-col p-8 bg-card">
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
            onChange={(e) => setStory(e.target.value)}
            placeholder="Once upon a time, in a quiet village nestled between mountains..."
            className="flex-1 min-h-[200px] w-full p-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                onClick={() => setStory(example === "A hero&apos;s journey" 
                  ? "A young warrior leaves their peaceful village to face the darkness that threatens the land. Through trials and loss, they discover inner strength they never knew existed."
                  : example === "A love story"
                  ? "Two strangers meet on a rainy evening. What begins as a chance encounter blossoms into something neither expected, changing their lives forever."
                  : "The old mansion held secrets. As Sarah explored the dusty rooms, she found a letter that would unravel everything she thought she knew."
                )}
                className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
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
function AIQuestionsScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const questions = [
    {
      question: "What emotion defines the beginning of your story?",
      options: ["Peaceful & calm", "Mysterious & tense", "Joyful & bright", "Melancholic & wistful"]
    },
    {
      question: "How does the emotional intensity change?",
      options: ["Builds gradually", "Sudden dramatic shift", "Waves of emotion", "Steady throughout"]
    },
    {
      question: "What feeling should the ending evoke?",
      options: ["Triumphant resolution", "Bittersweet reflection", "Open & wondering", "Peaceful closure"]
    }
  ]

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  return (
    <div className="min-h-[600px] flex flex-col p-8 bg-card">
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
            <p className="text-sm text-muted-foreground">Modescape AI</p>
            <div className="bg-secondary rounded-xl rounded-tl-none p-4">
              <p className="text-foreground">
                {currentQuestion < questions.length 
                  ? questions[currentQuestion].question
                  : "Perfect! I have a great sense of your story's emotional arc now."}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Question {Math.min(currentQuestion + 1, 3)} of 3</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + (answers.length === 3 ? 1 : 0)) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Options or Complete */}
        {currentQuestion < questions.length && answers.length < 3 ? (
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className="w-full p-4 rounded-xl border border-border bg-secondary/50 text-foreground text-left hover:border-primary/50 hover:bg-secondary transition-all"
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
                Your story moves through {answers.length} distinct emotional phases.
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
        {answers.length > 0 && currentQuestion < questions.length && (
          <div className="mt-8 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Your answers:</p>
            <div className="flex flex-wrap gap-2">
              {answers.map((answer, i) => (
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
function KeyboardScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([])

  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"]
  const blackKeys = [
    { note: "C#", position: 1 },
    { note: "D#", position: 2 },
    { note: "F#", position: 4 },
    { note: "G#", position: 5 },
    { note: "A#", position: 6 },
  ]

  const toggleNote = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter((n) => n !== note))
    } else if (selectedNotes.length < 3) {
      setSelectedNotes([...selectedNotes, note])
    }
  }

  return (
    <div className="min-h-[600px] flex flex-col p-8 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(2)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Step 3 of 4</span>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full">
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Choose 3 notes</h2>
          <p className="text-muted-foreground">
            Select notes that feel right for your story. Trust your instincts.
          </p>
        </div>

        {/* Selected notes display */}
        <div className="flex items-center gap-3 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center text-xl font-semibold transition-all",
                selectedNotes[i]
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {selectedNotes[i] || "?"}
            </div>
          ))}
          <p className="text-sm text-muted-foreground ml-4">
            {3 - selectedNotes.length} remaining
          </p>
        </div>

        {/* Piano Keyboard */}
        <div className="relative flex justify-center mb-8">
          <div className="relative flex">
            {/* White keys */}
            {whiteKeys.map((note, i) => (
              <button
                key={note}
                onClick={() => toggleNote(note)}
                className={cn(
                  "w-12 h-36 border border-border rounded-b-lg transition-all relative z-0",
                  selectedNotes.includes(note)
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/95 text-background hover:bg-foreground/80"
                )}
              >
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-medium">
                  {note}
                </span>
              </button>
            ))}
            {/* Black keys */}
            {blackKeys.map(({ note, position }) => (
              <button
                key={note}
                onClick={() => toggleNote(note)}
                className={cn(
                  "absolute w-8 h-24 rounded-b-lg transition-all z-10",
                  selectedNotes.includes(note)
                    ? "bg-primary"
                    : "bg-background border border-border hover:bg-secondary"
                )}
                style={{ left: `${position * 48 - 16}px` }}
              >
                <span className={cn(
                  "absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium",
                  selectedNotes.includes(note) ? "text-primary-foreground" : "text-foreground"
                )}>
                  {note}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hint */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Tip:</span> There&apos;s no wrong choice. 
            Each note combination will create a unique modal character for your melody.
          </p>
        </div>

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

// Screen 5: Generation Loading
function GenerationScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  const [progress, setProgress] = useState(0)

  // Simulate generation progress
  useState(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 2
      })
    }, 100)
    return () => clearInterval(interval)
  })

  const stages = [
    { name: "Analyzing emotional arc", threshold: 25 },
    { name: "Selecting modal scales", threshold: 50 },
    { name: "Composing melody", threshold: 75 },
    { name: "Finalizing arrangement", threshold: 100 },
  ]

  const currentStage = stages.findIndex((s) => progress < s.threshold) || stages.length - 1

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-8 bg-card">
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
            {stages[currentStage >= 0 ? currentStage : 0].name}...
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

        {/* Mode preview */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {["Ionian", "Dorian", "Aeolian"].map((mode, i) => (
            <div 
              key={mode}
              className={cn(
                "p-3 rounded-lg border transition-all",
                progress > (i + 1) * 30
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground"
              )}
            >
              <p className="text-sm font-medium">{mode}</p>
              <p className="text-xs opacity-70">
                {mode === "Ionian" ? "Happy" : mode === "Dorian" ? "Groovy" : "Sad"}
              </p>
            </div>
          ))}
        </div>

        {progress >= 100 && (
          <button
            onClick={() => onNavigate(5)}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Listen to Your Story
          </button>
        )}
      </div>
    </div>
  )
}

// Screen 6: Playback
function PlaybackScreen({ onNavigate }: { onNavigate: (s: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)

  const sections = [
    { name: "Opening", mode: "Dorian", emotion: "Mysterious", color: "bg-chart-4" },
    { name: "Rising Action", mode: "Mixolydian", emotion: "Building tension", color: "bg-chart-2" },
    { name: "Climax", mode: "Ionian", emotion: "Triumphant", color: "bg-chart-1" },
    { name: "Resolution", mode: "Aeolian", emotion: "Reflective", color: "bg-chart-3" },
  ]

  return (
    <div className="min-h-[600px] flex flex-col p-8 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => onNavigate(0)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Your Composition</span>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          Share
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full">
        {/* Visualizer placeholder */}
        <div className="h-40 rounded-xl bg-secondary/50 border border-border mb-6 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 rounded-full transition-all duration-150",
                  isPlaying ? "bg-primary" : "bg-muted-foreground/30"
                )}
                style={{ 
                  height: isPlaying ? `${20 + Math.random() * 60}%` : "20%",
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <p className="text-muted-foreground">Audio Visualizer</p>
            </div>
          )}
        </div>

        {/* Story section indicator */}
        <div className="mb-6">
          <div className="flex gap-1 mb-3">
            {sections.map((section, i) => (
              <button
                key={section.name}
                onClick={() => setCurrentSection(i)}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all",
                  i === currentSection ? section.color : "bg-muted"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{sections[currentSection].name}</p>
              <p className="text-sm text-muted-foreground">{sections[currentSection].emotion}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">{sections[currentSection].mode} Mode</p>
            </div>
          </div>
        </div>

        {/* Story text */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6 min-h-[120px]">
          <p className="text-foreground leading-relaxed">
            &ldquo;A young warrior leaves their peaceful village to face the darkness that threatens the land. 
            Through trials and loss, they discover inner strength they never knew existed.&rdquo;
          </p>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button 
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            className="p-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {isPlaying ? (
              <div className="w-6 h-6 flex items-center justify-center gap-1">
                <div className="w-1.5 h-5 bg-primary-foreground rounded" />
                <div className="w-1.5 h-5 bg-primary-foreground rounded" />
              </div>
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          <button 
            onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            className="p-3 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mode legend */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-sm font-medium text-foreground mb-3">Modes in this composition:</p>
          <div className="flex flex-wrap gap-2">
            {["Ionian (Happy)", "Dorian (Mysterious)", "Aeolian (Sad)", "Mixolydian (Groovy)"].map((mode) => (
              <span 
                key={mode} 
                className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground"
              >
                {mode}
              </span>
            ))}
          </div>
        </div>

        {/* Try again */}
        <button
          onClick={() => onNavigate(0)}
          className="mt-6 w-full py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
        >
          Create Another Story
        </button>
      </div>
    </div>
  )
}
