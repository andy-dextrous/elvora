"use client"

import { Button } from "@/components/ui/button"
import { CMSLink } from "@/payload/components/cms-link"
import type { HeroPrimaryBlock as HeroProps, Media } from "@/payload/payload-types"
import { gsap, useGSAP } from "@/providers/gsap"
import Image from "next/image"
import React, { useRef } from "react"

/****************************************************
 * Hero Component
 ****************************************************/

export const HeroPrimaryComponent: React.FC<HeroProps> = ({
  heading,
  content,
  backgroundImage,
  buttons,
}) => {
  const getBgUrl = () => {
    if (backgroundImage) {
      return (backgroundImage as Media).url
    }
    return "/assets/images/hero-default.jpg"
  }

  return (
    <section className="relative z-10 flex h-screen items-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          <div className="lg:from-dark-950 ltr:to-dark-950/60 lg:ltr:to-dark-950/10 rtl:to-dark-950/80 lg:rtl:to-dark-950/10 absolute inset-0 z-10 bg-gradient-to-b from-purple-950/70 lg:ltr:bg-gradient-to-r lg:rtl:bg-gradient-to-l" />

          <div className="bg-radial-home-hero absolute inset-y-0 left-0 z-10 w-[200%]" />

          <div className="absolute inset-0 rtl:scale-x-[-1]">
            <Image
              src={getBgUrl() || "/assets/images/hero-default.jpg"}
              alt={heading || "Hero Background"}
              className="absolute inset-0 h-full w-full object-cover object-[80%_50%]"
              fill
              priority
              quality={100}
              sizes="100vw"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div className="relative z-20 container">
        <div className="gap-content-lg flex w-full flex-col items-start text-white">
          <div className="lg:gap-content flex flex-col gap-6">
            <h1 className="w-full text-white md:max-w-[20ch]">{heading}</h1>

            <p className="max-w-[70ch] text-white">{content}</p>
            <div className="flex gap-4">
              {buttons?.map(({ button }, i) => (
                <CMSLink key={i} {...button.link} className="hover:cursor-pointer">
                  <Button
                    variant={button.buttonType === "primary" ? "default" : "secondary"}
                    size="lg"
                  >
                    {button.link.label}
                  </Button>
                </CMSLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
