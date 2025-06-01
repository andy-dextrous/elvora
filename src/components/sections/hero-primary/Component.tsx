"use client"

import ArrowDownIcon from "@/components/icons/arrow-down"
import ArrowRightIcon from "@/components/icons/arrow-right"
import Envelope from "@/components/icons/envelope"
import SpeechBubble from "@/components/icons/speech-bubble"
import { Grid, GridLines } from "@/components/layout/grid"
import { Button } from "@/components/ui/button"
import type { HeroPrimaryBlock as HeroProps, Media } from "@/payload/payload-types"
import Image from "next/image"
import Link from "next/link"
import React from "react"

/****************************************************
 * Hero Component
 ****************************************************/

export const HeroPrimaryComponent: React.FC<HeroProps> = ({
  heading,
  content,
  backgroundImage,
  buttons,
}) => {
  return (
    <section className="relative flex aspect-[1728/1614] w-full flex-col justify-between overflow-hidden bg-black py-0">
      {/* Background */}
      <Background backgroundImage={backgroundImage as Media} />

      {/* Grid Lines - Full Height */}
      <div className="pt-nav top-nav absolute inset-x-0 bottom-0">
        <GridLines />
      </div>

      {/* Content Grid - 100vh */}
      <div className="relative h-screen w-full">
        <Grid className="h-full grid-rows-[1fr_auto_auto] py-8">
          <div className="col-span-3 col-start-2 flex h-full items-center">
            <h1 className="text-white">
              Strategy <br /> Powered by <br /> Technology
            </h1>
          </div>

          <div className="col-span-2 col-start-5 flex flex-col justify-center space-y-8">
            <p className="text-white">
              We fuse commercial insight with digital capability to unlock rapid, scalable
              growth.
            </p>

            <div className="space-y-4">
              <Button variant="outline" size="lg" asChild className="w-full">
                <Link href="/contact">
                  Discovery Call
                  <ArrowRightIcon className="!h-[14px] !w-[24px]" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/contact">
                  See What We Do
                  <ArrowRightIcon className="!h-[14px] !w-[24px]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Bottom Left - Timestamp */}
          <div className="col-span-3 flex items-end">
            <div className="text-sm text-white">
              <div>Mon, 16th May 2025</div>
              <div>02:00 AM (GMT+10)</div>
            </div>
          </div>

          {/* Bottom Center - Scroll Indicator */}
          <div className="col-span-1 flex flex-col items-center justify-end space-y-4 text-white">
            <div className="text-xs font-light tracking-[0.4em] uppercase">
              Scroll Down
            </div>
            <ArrowDownIcon />
          </div>

          {/* Bottom Right - Contact Icons */}
          <div className="col-span-3 flex items-end justify-end space-x-4">
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
        <div className="mb-section-y col-span-1 col-start-4 flex items-center border-l-1 border-white">
          <p className="pr-10 pl-20 text-white/90">
            Elvora bridges the gap between strategic intent and operational delivery,
            integrating commercial planning, finance, lean processes and technology to
            drive measurable growth and sustained profitability.
          </p>
        </div>
      </Grid>
    </section>
  )
}

const Background = ({ backgroundImage }: { backgroundImage: Media | null }) => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="relative h-full w-full">
        {/* Top Down Fade */}
        <div className="from-dark-950 absolute inset-0 z-10 bg-gradient-to-b from-20% to-transparent to-40%" />

        {/* Background Image */}
        <div className="absolute inset-x-0 bottom-0 aspect-[3000/2843] w-full">
          <Image
            src={(backgroundImage as Media).url || "https://picsum.photos/1728/1260"}
            alt={"Hero Background"}
            className="absolute inset-0 h-full w-full object-cover object-[80%_50%]"
            fill
            priority
            quality={100}
            sizes="100vw"
            loading="eager"
          />
        </div>

        {/* Ellipse 1 - Royal Purple Spotlight */}
        <div className="bg-primary/70 absolute -bottom-[148px] -left-[370px] z-5 h-[700px] w-[700px] blur-[350px]" />

        {/* Ellipse 2 - Chrysler Blue Spotlight */}
        <div className="bg-secondary/60 absolute -right-[80.43px] -bottom-[405.61px] z-5 h-[1000px] w-[495.05px] -rotate-[15deg] blur-[350px]" />
      </div>
    </div>
  )
}
