"use client"

import { Button } from "@/components/ui/button"
import { CMSLink } from "@/payload/components/cms-link"
import type { HeroPrimaryBlock as HeroProps, Media } from "@/payload/payload-types"
import { gsap, useGSAP } from "@/providers/gsap"
import Image from "next/image"
import React, { useRef } from "react"

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
    <section className="relative z-10 flex aspect-[1728/1614] w-full overflow-hidden bg-black py-0">
      {/* Content */}

      <div className="pt-nav z-20 container h-screen">
        <h1 className="text-white">
          Strategy
          <br /> Powered By <br />
          Technology
        </h1>
      </div>

      {/* Background */}
      <Background backgroundImage={backgroundImage as Media} />
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
