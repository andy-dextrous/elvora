"use client"

import React, { useRef } from "react"
import { useGSAP, gsap } from "@/providers/gsap"
import type { CirclesAnimationBlock } from "@/payload/payload-types"

/*************************************************************************/
/*  CIRCLES ANIMATION COMPONENT
/*************************************************************************/

export const CirclesAnimationComponent: React.FC<CirclesAnimationBlock> = props => {
  return (
    <section className="bg-dark flex min-h-screen items-center">
      <div className="container grid grid-cols-12">
        <div className="gap-content col-span-5 flex flex-col">
          <h2 className="text-white">
            Bridging Vision & <span className="text-gradient">Execution</span>
          </h2>
          <p className="max-w-[460px] text-white">
            Many organisations invest in digital tools yet still leak profit because
            strategy, finance and tech aren't aligned. Elvora builds the bridge between
            these worlds, embedding data-driven automation that converts process waste
            into measurable revenue and margin gains — delivering transformation, not just
            plans.
          </p>
        </div>
        <div className="col-span-7 col-start-6">
          <CircleAnimation />
        </div>
      </div>
    </section>
  )
}

const CircleAnimation = () => {
  const animationRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Set initial state - both circles completely hidden
      gsap.set(".circle-path-primary", {
        drawSVG: "0%",
        transformOrigin: "center",
      })

      gsap.set(".circle-path-secondary", {
        drawSVG: "0%",
        rotation: 180,
        transformOrigin: "center",
      })

      gsap.set("#secondary-group", {
        transformOrigin: "center",
      })

      gsap.set("#primary-group", {
        transformOrigin: "center",
      })

      // Create a timeline for synchronized animations
      const tl = gsap.timeline()

      // Animate the secondary circle drawing from left side (75%) to complete
      tl.to(".circle-path", {
        drawSVG: "0 100%", // Start from left side, draw clockwise
        duration: 10,
        ease: "linear",
      })

      tl.to(
        "#primary-group",
        {
          x: 100,
          duration: 3,
          ease: "linear",
        },
        5
      )

      tl.to(
        "#secondary-group",
        {
          x: -100,
          duration: 3,
          ease: "linear",
        },
        5
      )

      tl.to(
        "#secondary-group",
        {
          rotation: 360,
          duration: 10,
          ease: "none",
          repeat: -1,
        },
        0
      )

      tl.to(
        "#primary-group",
        {
          rotation: 360,
          duration: 10,
          ease: "none",
          repeat: -1,
        },
        0
      )
    },
    { scope: animationRef }
  )

  return (
    <div
      ref={animationRef}
      className="relative flex h-full w-full items-center justify-center"
    >
      <svg
        width="400"
        height="400"
        viewBox="0 0 800 600"
        className="circle-svg w-full max-w-md"
      >
        <g id="secondary-group">
          <circle
            className="circle-path-secondary circle-path text-secondary"
            cx="400"
            cy="300"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
        <g id="primary-group">
          <circle
            className="circle-path-primary circle-path text-primary"
            cx="400"
            cy="300"
            r="150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  )
}
