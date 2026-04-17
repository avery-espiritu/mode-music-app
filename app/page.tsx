"use client"

import { useState } from "react"
import { FigmaCanvas } from "@/components/figma-canvas"

export default function FigmaMockup() {
  const [currentScreen, setCurrentScreen] = useState(0)

  return (
    <FigmaCanvas 
      currentScreen={currentScreen} 
      onNavigate={setCurrentScreen} 
    />
  )
}
