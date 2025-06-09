"use client"

import ArrowRightIcon from "@/components/icons/arrow-right"
import { Grid, GridLines } from "@/components/layout/grid"
import { CMSLink } from "@/payload/components/frontend/cms-link"
import { Media as PayloadMedia } from "@/payload/components/frontend/media"

import type { HeroFullBlock as HeroProps, Media } from "@/payload/payload-types"
import { gsap, useGSAP } from "@/providers/gsap"
import { cn } from "@/utilities/ui"
import React, { Fragment, useRef } from "react"

/****************************************************
 * Hero Content Component
 ****************************************************/

const HeroContent: React.FC<{
  content?: string
  buttons?: HeroProps["buttons"]
  buttonAppearance?: "default" | "outlineGradient"
}> = ({ content, buttons, buttonAppearance = "default" }) => {
  return (
    <Fragment>
      {content && <p className="font-light text-white">{content}</p>}

      {buttons && buttons.length > 0 && (
        <div className="space-y-4">
          {buttons.map((buttonItem, index) => (
            <CMSLink
              key={index}
              {...buttonItem.button.link}
              appearance={buttonAppearance}
              size="lg"
              className="w-full"
            >
              {buttonItem.button.link.label}
              <ArrowRightIcon className="!h-[14px] !w-[24px]" />
            </CMSLink>
          ))}
        </div>
      )}
    </Fragment>
  )
}

/****************************************************
 * Hero Full Component
 ****************************************************/

export const HeroFullComponent: React.FC<HeroProps> = ({
  heading,
  content,
  backgroundImage,
  buttons,
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const backgroundContainerRef = useRef<HTMLDivElement>(null)

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
    <section
      className={cn(
        // Base styles
        "bg-dark relative flex w-full flex-col justify-between overflow-hidden py-0",
        // Height
        "h-screen"
      )}
    >
      <div className="relative h-full w-full">
        <Grid className="h-full grid-rows-10 pb-8">
          {/*************************************************************************/}
          {/*  MAIN HERO CONTENT - TITLE AND CTA BUTTONS                           */}
          {/*************************************************************************/}
          <div
            className={cn(
              // Base styles
              "gap-content flex h-full flex-col justify-center",
              // Mobile
              "col-span-full row-span-12 row-start-1 pr-6 pl-6",
              // Tablet
              "md:col-span-5 md:col-start-2 md:pr-0 md:pl-0",
              // Desktop
              "lg:col-span-5 lg:col-start-2 lg:row-span-10",
              // XL
              "xl:col-span-3 xl:col-start-2"
            )}
          >
            <h1 ref={titleRef} className="title-hidden max-w-[10ch] text-white">
              {heading || "Strategy Powered by Technology"}
            </h1>
            <div
              className={cn(
                // Base styles
                "gap-content flex flex-col items-start justify-center",
                // XL
                "xl:hidden"
              )}
            >
              <HeroContent content={content} buttons={buttons} />
            </div>
          </div>

          {/*************************************************************************/}
          {/*  SECONDARY CONTENT AREA - DESKTOP LAYOUT                             */}
          {/*************************************************************************/}
          <div
            className={cn(
              // Base styles
              "hidden flex-col justify-center space-y-12",
              // Mobile
              "col-span-full row-span-4 row-start-1",
              // Tablet
              "md:col-span-5 md:col-start-2 md:row-span-3 md:row-start-6",
              // Small Laptops
              "lg:col-span-2 lg:col-start-6 lg:row-span-6 lg:row-start-4",
              // Large Laptops +
              "xl:col-start-5 xl:flex"
            )}
          >
            <HeroContent
              content={content}
              buttons={buttons}
              buttonAppearance="outlineGradient"
            />
          </div>
        </Grid>
      </div>

      {/*************************************************************************/}
      {/*  BACKGROUND IMAGE AND EFFECTS                                          */}
      {/*************************************************************************/}
      <Background
        backgroundImage={backgroundImage as Media}
        containerRef={backgroundContainerRef}
      />
    </section>
  )
}

const Background = ({
  backgroundImage,
  containerRef,
}: {
  backgroundImage: Media | null
  containerRef: React.RefObject<HTMLDivElement | null>
}) => {
  return (
    <Fragment>
      <div className="pt-nav top-nav inset-x-section-x pointer-events-none absolute bottom-0">
        <GridLines />
      </div>
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="relative h-full w-full">
          {/* Top Down Fade */}
          <div
            className={cn(
              // Base styles
              "absolute inset-0 z-10",
              // Mobile
              "from-dark-950 to-dark-950 via-dark/20 bg-gradient-to-b via-50% to-100%"
            )}
          />

          {/* Background Image */}
          <div
            className="absolute inset-x-0 bottom-0 size-full"
            data-id="hero-background-image"
            data-speed="0.9"
          >
            <PayloadMedia
              resource={backgroundImage}
              alt="Hero Background"
              fill
              priority
              imgClassName={cn(
                // Base styles
                "absolute inset-0 h-full w-full object-cover",
                // Mobile
                "object-[50%_50%]",
                // Desktop
                "lg:object-[80%_50%]"
              )}
              size="100vw"
              loading="eager"
            />
          </div>

          {/* Spotlight 1 - Royal Purple Spotlight */}
          <div
            className={cn(
              // Base styles
              "absolute z-50 h-[700px] w-[700px] blur-[350px]",
              "-bottom-[148px] -left-[370px]",
              // Mobile
              "bg-primary/30",
              // Desktop
              "lg:bg-primary/40"
            )}
            data-speed="0.8"
          />

          {/* Spotlight 2 - Chrysler Blue Spotlight */}
          <div
            className={cn(
              // Base styles
              "absolute z-50 h-[1200px] w-[495.05px] -rotate-[15deg] blur-[350px]",
              "-right-[80.43px] -bottom-[405.61px]",
              // Mobile
              "bg-secondary/30",
              // Desktop
              "lg:bg-secondary/40"
            )}
            data-speed="1.2"
          />
        </div>
      </div>
    </Fragment>
  )
}
