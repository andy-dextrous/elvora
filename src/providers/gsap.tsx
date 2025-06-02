"use client"

import canUseDOM from "@/utilities/canUseDOM"
import wildChildConfig from "@/wc.config"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

import { CustomEase } from "gsap/CustomEase"
import { CustomBounce } from "gsap/CustomBounce"

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Flip } from "gsap/Flip"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { SplitText } from "gsap/SplitText"
import { TextPlugin } from "gsap/TextPlugin"
import { usePathname } from "next/navigation"
import { createContext, useRef } from "react"
import { GSDevTools } from "gsap/GSDevTools"

/****************************************************
 * Setup GSAP Plugins and Defaults
 ****************************************************/

if (canUseDOM && wildChildConfig.gsap) {
  gsap.registerPlugin(
    useGSAP,
    DrawSVGPlugin,
    Flip,
    MotionPathPlugin,
    MorphSVGPlugin,
    ScrambleTextPlugin,
    ScrollTrigger,
    ScrollSmoother,
    ScrollToPlugin,
    SplitText,
    TextPlugin,
    CustomEase,
    CustomBounce,
    GSDevTools
  )
  gsap.defaults({
    ease: "power2.inOut",
    duration: 0.3,
  })
}

/****************************************************
 * Smooth Scroll Context
 ****************************************************/

interface GSAPContextType {
  smootherInstance: ScrollSmoother | null
}

const GSAPContext = createContext<GSAPContextType>({
  smootherInstance: null,
})

/****************************************************
 * Smooth Scroll Provider
 ****************************************************/

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const smootherRef = useRef<ScrollSmoother | null>(null)

  useGSAP(
    () => {
      if (wildChildConfig.smoothScroll) {
        smootherRef.current = ScrollSmoother.create({
          smooth: 1.5,
          effects: true,
          normalizeScroll: true,
        })
      }
    },
    {
      dependencies: [pathname],
      revertOnUpdate: true,
    }
  )

  return wildChildConfig.smoothScroll ? (
    <GSAPContext.Provider value={{ smootherInstance: smootherRef.current }}>
      {children}
    </GSAPContext.Provider>
  ) : (
    children
  )
}

export default SmoothScrollProvider

export { ScrollTrigger } from "gsap/ScrollTrigger"
export { GSDevTools } from "gsap/GSDevTools"
export { ScrollSmoother } from "gsap/ScrollSmoother"
export { GSAPContext }
export { Draggable } from "gsap/Draggable"
export { EaselPlugin } from "gsap/EaselPlugin"
export { EasePack } from "gsap/EasePack"
export { Flip } from "gsap/Flip"
export { InertiaPlugin } from "gsap/InertiaPlugin"
export { MorphSVGPlugin } from "gsap/MorphSVGPlugin"
export { MotionPathPlugin } from "gsap/MotionPathPlugin"
export { Observer } from "gsap/Observer"
export { PixiPlugin } from "gsap/PixiPlugin"
export { ScrollToPlugin } from "gsap/ScrollToPlugin"
export { TextPlugin } from "gsap/TextPlugin"

export * from "@gsap/react"
export * from "gsap"
