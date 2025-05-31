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
  const textLeftRef = useRef<HTMLDivElement>(null)
  const textRightRef = useRef<HTMLDivElement>(null)
  const textBottomRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      /*********************************************************
       * Master Timeline
       ********************************************************/

      const tl = gsap.timeline({
        // scrollTrigger: {
        //   trigger: sectionRef.current,
        //   start: "top top",
        //   end: "+=200%",
        //   pin: true,
        //   scrub: 1,
        // },
      })

      /*********************************************************
       * Constants
       ********************************************************/

      const DRAWSVG_DURATION = 1.5
      const ROTATION_DURATION = DRAWSVG_DURATION / 3
      const RETURN_TIME = DRAWSVG_DURATION / 4
      const TEXT_APPEAR_TIME = DRAWSVG_DURATION * 0.1
      const SCRAMBLE_DURATION = DRAWSVG_DURATION / 2

      /*********************************************************
       * Start by hiding all elements
       ********************************************************/

      tl.set(
        [
          "#circle-right-trails circle",
          "#circle-left-trails circle",
          "#inside",
          textLeftRef.current,
          textRightRef.current,
          textBottomRef.current,
        ],
        {
          autoAlpha: 0,
        }
      )

      /*********************************************************
       *  Calculate dynamic positioning based on circle centers
       ********************************************************/

      // Get the actual circle center positions from the SVG elements
      const rightCircleElement = animationRef.current?.querySelector(
        "#circle-right .lead-circle"
      )
      const leftCircleElement = animationRef.current?.querySelector(
        "#circle-left .lead-circle"
      )

      const rightCircleCenter = parseFloat(rightCircleElement?.getAttribute("cx") || "0")
      const leftCircleCenter = parseFloat(leftCircleElement?.getAttribute("cx") || "0")

      // Calculate the distance between centers
      const totalDistance = rightCircleCenter - leftCircleCenter

      // Each circle should move half the distance toward the center
      const moveDistance = totalDistance / 2

      /*********************************************************
       *  Then position primary circles on top of each other
       ********************************************************/

      tl.set("#circle-right #circle-right-group", {
        x: -moveDistance, // Move left by half distance
      })

      tl.set("#circle-left #circle-left-group", {
        x: moveDistance, // Move right by half distance
      })

      /*********************************************************
       *  Elements are in place, now show the container
       ********************************************************/

      tl.set(animationRef.current, {
        autoAlpha: 1,
      })

      /*********************************************************
       *  Now set up drawSVG for the trails
       ********************************************************/

      tl.set(["#circle-right .lead-circle", "#circle-left .lead-circle"], {
        drawSVG: "0%",
      })

      /*********************************************************
       *  Set the transform origin for the groups
       *  This is needed for the rotation to work
       ********************************************************/

      tl.set(["#circle-left-group", "#circle-right-group"], {
        transformOrigin: "center",
      })

      tl.set("#circle-left-group", {
        rotation: 180,
      })

      /*********************************************************
       *  Now reveal the circles
       ********************************************************/

      tl.to(
        ["#circle-left circle", "#circle-right circle"],
        {
          drawSVG: "0 100%",
          duration: DRAWSVG_DURATION,
          ease: "power2.inOut",
        },
        0
      )

      tl.to(
        "#circle-left-group, #circle-right-group",
        {
          rotation: "+=360",
          duration: ROTATION_DURATION,
          ease: "none",
          repeat: -1,
        },
        0
      )

      /*********************************************************
       *  Calculate trail elements once for performance
       ********************************************************/

      const leftTrails = document.querySelectorAll("#circle-left-trails circle")
      const rightTrails = document.querySelectorAll("#circle-right-trails circle")

      const leftTrailData = Array.from(leftTrails).map(trail => ({
        element: trail,
        opacity: Number(trail.getAttribute("data-opacity")),
        x: trail.getBoundingClientRect().x,
      }))

      const rightTrailData = Array.from(rightTrails).map(trail => ({
        element: trail,
        opacity: Number(trail.getAttribute("data-opacity")),
        x: trail.getBoundingClientRect().x,
      }))

      /*********************************************************
       *  Now reveal the trails as they cross the circles
       ********************************************************/

      tl.to(
        ["#circle-left #circle-left-group", "#circle-right #circle-right-group"],
        {
          x: 0,
          duration: DRAWSVG_DURATION,
          ease: "power1.inOut",
          onUpdate: function () {
            // Get actual rendered positions
            const leftCircle = document.querySelector("#circle-left-group")
            const rightCircle = document.querySelector("#circle-right-group")
            const transformedX = gsap.getProperty("#circle-left-group", "x")

            if (!leftCircle || !rightCircle) return
            const leftCircleRect = leftCircle.getBoundingClientRect()
            const rightCircleRect = rightCircle.getBoundingClientRect()
            // Left circle: reveal trails when circle passes them (moving right)

            leftTrailData.forEach(trail => {
              if (
                leftCircleRect.x + parseFloat(transformedX.toString()) <= trail.x &&
                trail.element.getAttribute("data-active") !== "true"
              ) {
                gsap.to(trail.element, {
                  autoAlpha: trail.opacity,
                  duration: 0.5,
                  ease: "power1.inOut",
                })

                trail.element.setAttribute("data-active", "true")
              }
            })

            rightTrailData.forEach(trail => {
              if (
                rightCircleRect.x - parseFloat(transformedX.toString()) >= trail.x &&
                trail.element.getAttribute("data-active") !== "true"
              ) {
                gsap.set(trail.element, {
                  autoAlpha: trail.opacity,
                  duration: 0.2,
                  ease: "power1.inOut",
                })

                trail.element.setAttribute("data-active", "true")
              }
            })
          },
        },
        RETURN_TIME
      )

      /*********************************************************
       *  Reveal text and scramble
       ********************************************************/

      tl.to(
        textLeftRef.current,
        {
          autoAlpha: 1,
          duration: 0.5,
          ease: "power1.inOut",
        },
        TEXT_APPEAR_TIME
      )

      tl.to(
        textRightRef.current,
        {
          autoAlpha: 1,
        },
        TEXT_APPEAR_TIME
      )

      // Scramble text animations

      tl.to(
        Array.from(textLeftRef.current?.querySelectorAll("p") || []),
        {
          duration: SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "upperCase",

            newClass: "text-white",
          },
        },
        TEXT_APPEAR_TIME
      )

      tl.to(
        Array.from(textRightRef.current?.querySelectorAll("p") || []),
        {
          duration: SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "lowerCase",

            newClass: "text-white",
          },
        },
        TEXT_APPEAR_TIME
      )

      tl.to(
        Array.from(textBottomRef.current?.querySelectorAll("p") || []),
        {
          duration: SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "lowerCase",
            revealDelay: 1.5,
            speed: 0.8,
            newClass: "text-white",
          },
        },
        TEXT_APPEAR_TIME
      )
    },
    { scope: animationRef }
  )

  return (
    <div
      ref={animationRef}
      className="relative flex h-full w-full items-center justify-center opacity-0"
    >
      <div className="flex h-full w-full flex-col gap-10">
        <div className="relative">
          <SVGComponent />
          <div className="absolute inset-0 grid h-full w-full grid-cols-12 grid-rows-12">
            <div
              ref={textLeftRef}
              className="gap-content col-span-3 col-start-2 row-span-6 row-start-4 flex flex-col items-center justify-center"
            >
              <p className="text-white">Revenue</p>
              <p className="text-white">Margin</p>
              <p className="text-white">Efficiency</p>
            </div>
            <div
              ref={textRightRef}
              className="gap-content col-span-3 col-start-9 row-span-6 row-start-4 flex flex-col items-center justify-center"
            >
              <p className="text-white">Automation</p>
              <p className="text-white">Intelligence</p>
              <p className="text-white">Integration</p>
            </div>
          </div>
        </div>
        <div ref={textBottomRef} className="flex w-full justify-center">
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

    <g id="circle-reveal">
      {/* Circle Right */}
      <g id="circle-right">
        <g id="circle-right-group">
          <circle
            className="stroke-primary lead-circle transform-origin-center fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={664.46}
            cy={316.1}
            r={313.19}
          />
        </g>
        <g id="circle-right-trails">
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={580.78}
            cy={316.1}
            r={313.19}
            data-opacity={0.1}
          />
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={594.73}
            cy={316.1}
            r={313.19}
            data-opacity={0.2}
          />
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={608.68}
            cy={316.1}
            r={313.19}
            data-opacity={0.3}
          />
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={622.62}
            cy={316.1}
            r={313.19}
            data-opacity={0.4}
          />
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={636.57}
            cy={316.1}
            r={313.19}
            data-opacity={0.5}
          />
          <circle
            className="stroke-primary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={650.51}
            cy={316.1}
            r={313.19}
            data-opacity={0.6}
          />
        </g>
      </g>
      {/* Circle Left */}
      <g id="circle-left">
        <g id="circle-left-group">
          <circle
            className="stroke-secondary lead-circle fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={315.81}
            cy={316.1}
            r={313.19}
          />
        </g>
        <g id="circle-left-trails">
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={329.76}
            cy={316.1}
            r={313.19}
            data-opacity={0.6}
          />
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={343.7}
            cy={316.1}
            r={313.19}
            data-opacity={0.5}
          />
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={357.65}
            cy={316.1}
            r={313.19}
            data-opacity={0.4}
          />
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={371.6}
            cy={316.1}
            r={313.19}
            data-opacity={0.3}
          />
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={385.54}
            cy={316.1}
            r={313.19}
            data-opacity={0.2}
          />
          <circle
            className="stroke-secondary isolate fill-none"
            style={{ strokeWidth: "1.19px" }}
            cx={399.49}
            cy={316.1}
            r={313.19}
            data-opacity={0.1}
          />
        </g>
      </g>
      {/* Inside */}
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
      {/* Frame */}
      <rect id="frame" className="fill-none" width={981.74} height={631.55} />
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
