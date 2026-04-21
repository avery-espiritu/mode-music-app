# Modalation

Final project for EDUC1485. An interactive music education app that generates original modal melodies from your story using AI. You write a short story, answer emotional questions, pick 3 anchor notes on a piano keyboard, and the app composes a 4-section melody — each section in a different musical mode that matches the emotional arc of your narrative.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, Tone.js, and the Anthropic Claude API.

## Prerequisites

- **Node.js** 20.9 or newer ([nodejs.org](https://nodejs.org))
- **pnpm** — the repo is pinned to pnpm via the `packageManager` field in `package.json`
- **Anthropic API key** — the AI melody generation requires a key from [console.anthropic.com](https://console.anthropic.com)

### Install pnpm (if you don't have it)

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

## Setup

**1. Clone and install dependencies**

```bash
git clone <repo-url>
cd mode-music-app
pnpm install
```

**2. Create your environment file**

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

> Your key stays local — `.env.local` is in `.gitignore` and is never committed.

If you don't have a `.env.example`, create `.env.local` manually with the line above.

**3. Start the dev server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. **Story Input** — Write a short story or scene (100–500 characters works well)
2. **AI Questions** — Answer 3 emotional questions about your story's arc
3. **Keyboard** — Click 3 notes on the interactive 2-octave piano to use as anchor notes
4. **Generation** — Claude AI composes a 4-section melody, choosing a musical mode for each narrative phase (Opening → Development → Climax → Resolution)
5. **Playback** — Listen to each section or play the full composition; see the scale notes used per section

## Musical modes

The AI selects from all 7 church modes based on emotional context:

| Mode | Character | Used for |
|------|-----------|----------|
| Ionian | Bright, major | Joy, triumph, celebration |
| Dorian | Soulful, minor+maj6 | Hope within sadness, resilience |
| Phrygian | Dark, minor+b2 | Danger, mystery, tension |
| Lydian | Dreamy, major+#4 | Wonder, magic, the supernatural |
| Mixolydian | Adventurous, major+b7 | Heroism, quests, bittersweet climax |
| Aeolian | Melancholy, natural minor | Grief, loss, introspection |
| Locrian | Unstable, diminished | Dread, chaos, peak tension |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build (type-checks too) |
| `pnpm start` | Run production server (after build) |
| `pnpm lint` | Run ESLint |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key for melody generation |
| `ANTHROPIC_MODEL` | No | Override the Claude model (default: `claude-opus-4-7`) |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** component primitives (Radix UI)
- **Tone.js** — web audio synthesis for piano playback with natural note decay
- **Anthropic Claude API** — AI melody composition
- **Zod** — schema validation for API requests and AI responses
