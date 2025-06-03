"use client"

import ArrowDownIcon from "@/components/icons/arrow-down"
import ArrowRightIcon from "@/components/icons/arrow-right"
import Envelope from "@/components/icons/envelope"
import SpeechBubble from "@/components/icons/speech-bubble"
import { Grid, GridLines } from "@/components/layout/grid"
import { Button } from "@/components/ui/button"
import type { HeroPrimaryBlock as HeroProps, Media } from "@/payload/payload-types"
import { useGSAP, gsap } from "@/providers/gsap"
import Image from "next/image"
import Link from "next/link"
import React, { Fragment, useRef } from "react"

/****************************************************
 * Hero Content Component
 ****************************************************/

const HeroContent: React.FC<{ variant?: "default" | "outlineGradient" }> = ({
  variant = "default",
}) => {
  return (
    <Fragment>
      <p className="font-light text-white">
        We fuse commercial insight with digital capability to unlock rapid, scalable
        growth.
      </p>

      <div className="space-y-4">
        <Button
          variant={variant === "outlineGradient" ? "outlineGradient" : undefined}
          size="lg"
          asChild
          className="w-full"
        >
          <Link href="/contact">
            Discovery Call
            <ArrowRightIcon className="!h-[14px] !w-[24px]" />
          </Link>
        </Button>

        <Button
          variant={variant === "outlineGradient" ? "outlineGradient" : undefined}
          size="lg"
          className="w-full"
          asChild
        >
          <Link href="/contact">
            See What We Do
            <ArrowRightIcon className="!h-[14px] !w-[24px]" />
          </Link>
        </Button>
      </div>
    </Fragment>
  )
}

/****************************************************
 * Hero Scroll Indicator Component
 ****************************************************/

const HeroScrollIndicator: React.FC<{
  textRef: React.RefObject<HTMLDivElement | null>
}> = ({ textRef }) => {
  const arrowRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // Only arrow bounce animation here - continuous and independent
    const bounceTimeline = gsap.timeline({
      defaults: { duration: 0.7, ease: "power1.inOut" },
      yoyo: true,
      repeat: -1,
    })
    bounceTimeline.to(arrowRef.current, { y: 20 })
  })

  return (
    <div className="col-span-1 col-start-4 row-span-1 row-start-11 flex flex-col items-center justify-end space-y-4 text-white">
      <div ref={textRef} className="text-xs font-light tracking-[0.4em] uppercase">
        Scroll Down
      </div>
      <div ref={arrowRef}>
        <ArrowDownIcon />
      </div>
    </div>
  )
}

/****************************************************
 * Hero Component
 ****************************************************/

export const HeroPrimaryComponent: React.FC<HeroProps> = ({
  heading,
  content,
  backgroundImage,
  buttons,
}) => {
  const timestampDateRef = useRef<HTMLDivElement>(null)
  const timestampTimeRef = useRef<HTMLDivElement>(null)
  const scrollTextRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const backgroundContainerRef = useRef<HTMLDivElement>(null)
  const backgroundImageRef = useRef<HTMLImageElement>(null)
  const uspRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    let isUAE = true

    function getCurrentTimes() {
      const now = new Date()

      // UAE Time (GMT+4)
      const uaeDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Dubai",
      }).format(now)

      const uaeTime = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Dubai",
      }).format(now)

      // Ireland Time (GMT+0/+1)
      const irelandDate = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Dublin",
      }).format(now)

      const irelandTime = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Europe/Dublin",
      }).format(now)

      return {
        uae: {
          date: uaeDate,
          time: `${uaeTime} (GMT+4)`,
        },
        ireland: {
          date: irelandDate,
          time: `${irelandTime} (GMT+0)`,
        },
      }
    }

    function animateElements() {
      const times = getCurrentTimes()
      const current = isUAE ? times.uae : times.ireland

      // Animate timestamp
      gsap.to(timestampDateRef.current, {
        duration: 2,
        scrambleText: {
          text: current.date,
          chars: "lowerCase",
          newClass: "text-sm text-white",
        },
      })

      gsap.to(timestampTimeRef.current, {
        duration: 2,
        scrambleText: {
          text: current.time,
          chars: "lowerCase",
          newClass: "text-sm text-white",
        },
      })

      // Animate scroll text
      gsap.to(scrollTextRef.current, {
        duration: 2,
        scrambleText: {
          text: "{original}",
          chars: "lowerCase",
          newClass: "text-xs font-light tracking-[0.4em] uppercase text-white",
        },
      })

      isUAE = !isUAE
    }

    // Set initial timestamp
    const initialTimes = getCurrentTimes()
    if (timestampDateRef.current && timestampTimeRef.current) {
      timestampDateRef.current.textContent = initialTimes.uae.date
      timestampTimeRef.current.textContent = initialTimes.uae.time
    }

    // Title reveal animation
    gsap.effects.titleReveal(titleRef.current, {
      duration: 1.3,
      stagger: 0.3,
      revertOnComplete: true,
    })

    // Usp reveal animation
    gsap.effects.titleReveal(uspRef.current, {
      trigger: {
        trigger: uspRef.current,
        start: "top 90%",
        end: "bottom 70%",
        scrub: false,
      },
      revertOnComplete: true,
    })

    // Gentle continuous zoom on background image
    if (backgroundImageRef.current) {
      gsap.to(backgroundImageRef.current, {
        scale: 1.1,
        duration: 16,
        repeat: -1,
        yoyo: true,
        ease: "linear",
        force3D: true,
      })
    }

    // Single master timeline controlling both animations
    const masterTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 8, // 10 seconds total (2 second animation + 8 second delay)
    })

    masterTimeline.call(animateElements)
  })

  return (
    <section className="bg-dark relative flex h-auto w-full flex-col justify-between overflow-hidden py-0 lg:h-[160vh]">
      <div className="relative h-screen w-full">
        <Grid className="h-full grid-rows-10 pb-8">
          <div className="gap-content col-span-full row-span-12 row-start-1 flex h-full flex-col justify-center md:col-span-5 md:col-start-2 lg:col-span-5 lg:col-start-2 lg:row-span-10 xl:col-span-3 xl:col-start-2">
            <h1 ref={titleRef} className="title-hidden max-w-[10ch] text-white">
              Strategy Powered by Technology
            </h1>
            <div className="gap-content flex flex-col items-start justify-center xl:hidden">
              <HeroContent />
            </div>
          </div>

          <div className="col-span-full row-span-4 row-start-1 hidden flex-col justify-center space-y-12 md:col-span-5 md:col-start-2 md:row-span-3 md:row-start-6 lg:col-span-2 lg:col-start-6 lg:row-span-6 lg:row-start-4 xl:col-start-5 xl:flex">
            <HeroContent variant="outlineGradient" />
          </div>

          {/* Timestamp */}
          <div className="z-10 col-span-1 col-start-1 row-span-2 row-start-10 hidden items-end xl:flex">
            <div className="text-sm text-white">
              <div ref={timestampDateRef}>Mon, 16th May 2025</div>
              <div ref={timestampTimeRef}>02:00 AM (GMT+4)</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <HeroScrollIndicator textRef={scrollTextRef} />

          {/* Bottom Right - Contact Icons */}
          <div className="col-span-3 col-start-7 row-span-2 row-start-10 hidden items-end justify-end space-x-4 lg:flex">
            <Button icon variant="ghost">
              <Envelope className="!h-6 !w-6" />
            </Button>
            <Button icon variant="ghost">
              <SpeechBubble className="!h-6 !w-6" />
            </Button>
          </div>
        </Grid>
      </div>
      <Grid className="h-auto grid-rows-[1fr_auto_auto] py-8">
        <div className="mb-section-y col-span-7 col-start-1 mt-40 flex items-center border-l-1 border-white lg:col-span-1 lg:col-start-4 lg:mt-0">
          <p ref={uspRef} className="pr-10 pl-12 text-white/90">
            Elvora bridges the gap between strategic intent and operational delivery,
            integrating commercial planning, finance, lean processes and technology to
            drive measurable growth and sustained profitability.
          </p>
        </div>
      </Grid>

      {/* Background */}
      <Background
        backgroundImage={backgroundImage as Media}
        containerRef={backgroundContainerRef}
        imageRef={backgroundImageRef}
      />
    </section>
  )
}

const Background = ({
  backgroundImage,
  containerRef,
  imageRef,
}: {
  backgroundImage: Media | null
  containerRef: React.RefObject<HTMLDivElement | null>
  imageRef: React.RefObject<HTMLImageElement | null>
}) => {
  return (
    <Fragment>
      <div className="pt-nav top-nav inset-x-section-x absolute bottom-0">
        <GridLines />
      </div>
      <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          {/* Top Down Fade */}
          <div className="from-dark-950 absolute inset-0 z-10 bg-gradient-to-b from-10% to-transparent to-100% lg:from-30% lg:to-transparent lg:to-60%" />

          {/* Background Image */}
          <div className="absolute inset-x-0 bottom-0 size-full">
            <Image
              ref={imageRef}
              src={(backgroundImage as Media).url || "https://picsum.photos/1728/1260"}
              alt={"Hero Background"}
              className="absolute inset-0 h-full w-full object-cover object-[50%_50%] lg:object-[80%_50%]"
              fill
              priority
              quality={100}
              sizes="100vw"
              loading="eager"
              data-speed="0.8"
            />
          </div>

          {/* Spotlight 1 - Royal Purple Spotlight */}
          <div
            className="bg-primary/30 lg:bg-primary/70 absolute -bottom-[148px] -left-[370px] z-5 h-[700px] w-[700px] blur-[350px]"
            data-speed="0.8"
          />

          {/* Spotlight 2 - Chrysler Blue Spotlight */}
          <div
            className="bg-secondary/30 lg:bg-secondary/60 absolute -right-[80.43px] -bottom-[405.61px] z-5 h-[1200px] w-[495.05px] -rotate-[15deg] blur-[350px]"
            data-speed="1.2"
          />
        </div>
      </div>
    </Fragment>
  )
}
