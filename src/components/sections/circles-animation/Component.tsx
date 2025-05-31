"use client"

import React, { useRef } from "react"
import { useGSAP, gsap, ScrollTrigger } from "@/providers/gsap"
import type { CirclesAnimationBlock } from "@/payload/payload-types"

/*************************************************************************/
/*  CIRCLES ANIMATION COMPONENT
/*************************************************************************/

export const CirclesAnimationComponent: React.FC<CirclesAnimationBlock> = props => {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section className="bg-dark flex h-screen items-center" ref={sectionRef}>
      <div className="container flex h-full items-center">
        <div className="flex flex-5 flex-col gap-10">
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
        <div className="flex-7">
          <CircleAnimation sectionRef={sectionRef} />
        </div>
      </div>
    </section>
  )
}

const CircleAnimation = ({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>
}) => {
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

      // Create timeline with scroll control
      const tl = gsap.timeline({
        // scrollTrigger: {
        //   trigger: sectionRef.current,
        //   start: "top top",
        //   end: "+=200%",
        //   pin: true,
        //   scrub: 1,
        // },
      })

      tl.to(".circle-path", {
        drawSVG: "0 100%",
        duration: 10,
        ease: "power2.inOut",
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
        "#secondary-group, #primary-group",
        {
          rotation: 360,
          duration: 3,
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
      <div className="flex h-full w-full flex-col gap-10">
        <div className="relative">
          <SVGComponent />
          <div className="absolute inset-0 grid h-full w-full grid-cols-12 grid-rows-12">
            <div className="gap-content col-span-3 col-start-2 row-span-6 row-start-4 flex flex-col items-center justify-center">
              <p className="text-white">Revenue</p>
              <p className="text-white">Margin</p>
              <p className="text-white">Efficiency</p>
            </div>
            <div className="gap-content col-span-3 col-start-9 row-span-6 row-start-4 flex flex-col items-center justify-center">
              <p className="text-white">Automation</p>
              <p className="text-white">Intelligence</p>
              <p className="text-white">Integration</p>
            </div>
          </div>
        </div>
        <div className="flex w-full justify-center">
          <p className="text-white">Transformation Delivered</p>
        </div>
      </div>
    </div>
  )
}

const SVGComponent = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    id="Layer_2"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 981.74 631.55"
    {...props}
  >
    <defs>
      <linearGradient
        id="linear-gradient"
        x1={350.68}
        y1={396.03}
        x2={629.6}
        y2={396.03}
        gradientTransform="translate(0 712.13) scale(1 -1)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#40f" />
        <stop offset={1} stopColor="#7944b3" />
      </linearGradient>
      <mask
        id="mask"
        x={430.15}
        y={211.5}
        width={119.57}
        height={209.19}
        maskUnits="userSpaceOnUse"
      >
        <g id="mask0_691_1574">
          <path
            className="fill-white"
            d="M481.33,341.3l68.39,79.4-119.55-55.94,51.17-23.46ZM481.47,341.23l49.73-22.8-1.86-106.93-47.89,129.73h.02Z"
          />
        </g>
      </mask>
    </defs>
    <g id="Layer_1-2">
      <g id="circle-reveal">
        <g id="circle-right">
          <circle
            className="stroke-primary isolate fill-none opacity-10"
            style={{ strokeWidth: "1.19px" }}
            cx={580.78}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary isolate fill-none opacity-20"
            style={{ strokeWidth: "1.19px" }}
            cx={594.73}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary isolate fill-none opacity-30"
            style={{ strokeWidth: "1.19px" }}
            cx={608.68}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary isolate fill-none opacity-40"
            style={{ strokeWidth: "1.19px" }}
            cx={622.62}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary isolate fill-none opacity-50"
            style={{ strokeWidth: "1.19px" }}
            cx={636.57}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary isolate fill-none opacity-60"
            style={{ strokeWidth: "1.19px" }}
            cx={650.51}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-primary fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={664.46}
            cy={316.1}
            r={313.19}
          />
        </g>
        <g id="circle-left">
          <circle
            className="stroke-secondary fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={315.81}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-60"
            style={{ strokeWidth: "1.19px" }}
            cx={329.76}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-50"
            style={{ strokeWidth: "1.19px" }}
            cx={343.7}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-40"
            style={{ strokeWidth: "1.19px" }}
            cx={357.65}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-30"
            style={{ strokeWidth: "1.19px" }}
            cx={371.6}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-20"
            style={{ strokeWidth: "1.19px" }}
            cx={385.54}
            cy={316.1}
            r={313.19}
          />
          <circle
            className="stroke-secondary isolate fill-none opacity-10"
            style={{ strokeWidth: "1.19px" }}
            cx={399.49}
            cy={316.1}
            r={313.19}
          />
        </g>
        <g id="inside">
          <path
            style={{ fill: "url(#linear-gradient)" }}
            d="M490.14,55.16c84.09,56.29,139.46,152.15,139.46,260.94s-55.37,204.65-139.46,260.94c-84.09-56.29-139.46-152.15-139.46-260.94s55.37-204.65,139.46-260.94Z"
          />
          <g style={{ mask: "url(#mask)" }}>
            <g id="logomark">
              <path
                className="fill-white"
                d="M549.71,211.5h-119.55v209.19h119.55v-209.19Z"
              />
            </g>
          </g>
        </g>
        <rect id="frame" className="fill-none" width={981.74} height={631.55} />
      </g>
    </g>
  </svg>
)

const OldAnimationCircles = () => {
  return (
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
  )
}
