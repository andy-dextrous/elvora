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
import React, { Fragment } from "react"

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
    <section className="bg-dark relative flex h-[160vh] w-full flex-col justify-between overflow-hidden py-0">
      <div className="relative h-screen w-full">
        <Grid className="h-full grid-rows-10 pb-8">
          <div className="col-span-3 col-start-2 row-span-10 row-start-1 flex h-full items-center">
            <h1 className="text-white">Strategy Powered by Technology</h1>
          </div>

          <div className="col-span-2 col-start-5 row-span-6 row-start-4 flex flex-col justify-center space-y-12">
            <p className="font-light text-white">
              We fuse commercial insight with digital capability to unlock rapid, scalable
              growth.
            </p>

            <div className="space-y-4">
              <Button variant="outlineGradient" size="lg" asChild className="w-full">
                <Link href="/contact">
                  Discovery Call
                  <ArrowRightIcon className="!h-[14px] !w-[24px]" />
                </Link>
              </Button>

              <Button variant="outlineGradient" size="lg" className="w-full" asChild>
                <Link href="/contact">
                  See What We Do
                  <ArrowRightIcon className="!h-[14px] !w-[24px]" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Bottom Left - Timestamp */}
          <div className="col-span-3 col-start-1 row-span-2 row-start-10 flex items-end">
            <div className="text-sm text-white">
              <div>Mon, 16th May 2025</div>
              <div>02:00 AM (GMT+10)</div>
            </div>
          </div>

          {/* Bottom Center - Scroll Indicator */}
          <div className="col-span-1 col-start-4 row-span-2 row-start-10 flex flex-col items-center justify-end space-y-4 text-white">
            <div className="text-xs font-light tracking-[0.4em] uppercase">
              Scroll Down
            </div>
            <ArrowDownIcon />
          </div>

          {/* Bottom Right - Contact Icons */}
          <div className="col-span-3 col-start-7 row-span-2 row-start-10 flex items-end justify-end space-x-4">
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
          <p className="pr-10 pl-12 text-white/90">
            Elvora bridges the gap between strategic intent and operational delivery,
            integrating commercial planning, finance, lean processes and technology to
            drive measurable growth and sustained profitability.
          </p>
        </div>
      </Grid>

      {/* Background */}
      <Background backgroundImage={backgroundImage as Media} />
    </section>
  )
}

const Background = ({ backgroundImage }: { backgroundImage: Media | null }) => {
  return (
    <Fragment>
      <div className="pt-nav top-nav absolute inset-x-0 bottom-0">
        <GridLines />
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          {/* Top Down Fade */}
          <div className="from-dark-950 absolute inset-0 z-10 bg-gradient-to-b from-30% to-transparent to-60%" />

          {/* Background Image */}
          <div className="absolute inset-x-0 bottom-0 size-full">
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

          {/* Spotlight 1 - Royal Purple Spotlight */}
          <div className="bg-primary/70 absolute -bottom-[148px] -left-[370px] z-5 h-[700px] w-[700px] blur-[350px]" />

          {/* Spotlight 2 - Chrysler Blue Spotlight */}
          <div className="bg-secondary/60 absolute -right-[80.43px] -bottom-[405.61px] z-5 h-[1200px] w-[495.05px] -rotate-[15deg] blur-[350px]" />
        </div>
      </div>
    </Fragment>
  )
}
