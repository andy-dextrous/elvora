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

/****************************************************
 * Setup GSAP Plugins and Defaults
 ****************************************************/

if (canUseDOM) {
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
    CustomBounce
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
          smooth: 1,
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
      <div id="smooth-wrapper">
        <div id="smooth-content">{children}</div>
      </div>
    </GSAPContext.Provider>
  ) : (
    children
  )
}

export default SmoothScrollProvider
export { ScrollTrigger } from "gsap/ScrollTrigger"
export * from "@gsap/react"
export * from "gsap"
