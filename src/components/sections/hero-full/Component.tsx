"use client"

import { Grid, GridLines } from "@/components/layout/grid"
import type { HeroFullBlock as HeroProps } from "@/payload/payload-types"
import { gsap, useGSAP } from "@/providers/gsap"
import parse from "html-react-parser"
import React, { useRef } from "react"
import { tv } from "tailwind-variants"
import { HeroLayout } from "./hero-layout"
import { ImageBackground } from "./image-background"

/****************************************************
 * Hero Container Variants Configuration
 ****************************************************/

const heroContainerVariants = tv({
  base: "pt-first-section-nav-offset relative flex w-full flex-col justify-between overflow-hidden border-b",
  variants: {
    size: {
      full: "h-screen",
      md: "min-h-[65vh]",
      sm: "min-h-[50vh]",
    },
    colorScheme: {
      "background-image": "bg-dark border-light-border",
      dark: "bg-dark border-light-border",
      white: "border-dark-border bg-white",
      primary: "bg-primary border-light-border",
      secondary: "bg-secondary border-light-border",
    },
  },
  defaultVariants: {
    size: "full",
    colorScheme: "background-image",
  },
})

/****************************************************
 * Hero Full Component
 ****************************************************/

export const HeroFullComponent: React.FC<HeroProps> = ({
  heading,
  content,
  backgroundImage,
  buttons,
  size = "full",
  colorScheme = "background-image",
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const backgroundContainerRef = useRef<HTMLDivElement>(null)
  const timestampDateRef = useRef<HTMLDivElement>(null)
  const timestampTimeRef = useRef<HTMLDivElement>(null)

  // Parse heading and convert span tags to gradient elements
  const parsedHeading = heading
    ? parse(heading, {
        replace: (domNode: any) => {
          if (domNode.name === "span") {
            return <span className="text-gradient">{domNode.children[0]?.data}</span>
          }
        },
      })
    : null

  /****************************************************
   * GSAP Animations
   ****************************************************/

  useGSAP(() => {
    // Title reveal animation
    gsap.effects.titleReveal(titleRef.current, {
      duration: 1.3,
      stagger: 0.3,
      revertOnComplete: true,
    })

    // Gentle continuous zoom on background image
    const heroImage = document.querySelector('[data-id="hero-background-image"]')
    if (heroImage) {
      gsap.to(heroImage, {
        scale: 1.2,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "linear",
        force3D: true,
      })
    }
  })

  return (
    <section className={heroContainerVariants({ size, colorScheme })}>
      <div className="relative h-full w-full">
        <Grid className="h-full grid-rows-10">
          <HeroLayout
            size={size}
            colorScheme={colorScheme}
            titleRef={titleRef}
            parsedHeading={parsedHeading}
            fallbackHeading={heading}
            content={content}
            buttons={buttons}
            timestampDateRef={timestampDateRef}
            timestampTimeRef={timestampTimeRef}
          />
        </Grid>
      </div>

      {/*************************************************************************/}
      {/*  GRID LINES                                         */}
      {/*************************************************************************/}
      <div className="pt-nav top-nav inset-x-section-x pointer-events-none absolute bottom-0">
        <GridLines />
      </div>

      {/*************************************************************************/}
      {/*  BACKGROUND IMAGE AND EFFECTS                                          */}
      {/*************************************************************************/}
      {colorScheme === "background-image" && (
        <ImageBackground
          backgroundImage={backgroundImage}
          containerRef={backgroundContainerRef}
        />
      )}
    </section>
  )
}
