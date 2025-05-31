"use client"

import React, { useRef } from "react"
import { useGSAP, gsap, ScrollTrigger, GSDevTools } from "@/providers/gsap"
import type { CirclesAnimationBlock } from "@/payload/payload-types"

/*************************************************************************/
/*  CIRCLES ANIMATION COMPONENT
/*************************************************************************/

const CirclesAnimationComponent: React.FC<CirclesAnimationBlock> = props => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const textLeftRef = useRef<HTMLDivElement>(null)
  const textRightRef = useRef<HTMLDivElement>(null)
  const textBottomRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    /*********************************************************
     * Constants
     ********************************************************/

    const TOTAL_DURATION = 5
    const ROTATIONS_DURING_DRAW = 3 // Number of rotations while circles are being drawn
    const PIN_DURATION = "200%" // How long to pin (200% = 2x viewport height of scrolling)
    const DRAWSVG_START_TIME = 0
    const DRAWSVG_DURATION = TOTAL_DURATION * 0.5 // when circles finish drawing
    const CIRCLES_SPLIT_START = TOTAL_DURATION * 0.15 // at this time, circles start to split
    const TEXT_APPEAR_TIME = TOTAL_DURATION * 0.2
    const TEXT_FADE_DURATION = TOTAL_DURATION * 0.2
    const TEXT_SCRAMBLE_DURATION = TOTAL_DURATION * 0.6
    const TEXT_END_STAGGER = 0.5 // Delay between each p element finishing
    const BOTTOM_TEXT_APPEAR_TIME = TOTAL_DURATION * 0.7 // Bottom text appears later
    const BOTTOM_TEXT_SCRAMBLE_DURATION = TOTAL_DURATION * 0.4 // Bottom text scramble duration
    const INSIDE_FADE_DURATION = TOTAL_DURATION * 0.2
    const INSIDE_APPEAR_TIME = TOTAL_DURATION - INSIDE_FADE_DURATION
    const TRAIL_FADE_DURATION = TOTAL_DURATION * 0.05

    // Ease constants
    const DRAWSVG_EASE = "power2.inOut"
    const ROTATION_EASE = "none"
    const CIRCLE_MOVEMENT_EASE = "power1.inOut"
    const TEXT_FADE_EASE = "power1.out"
    const INSIDE_FADE_EASE = "power1.in"
    const TRAIL_FADE_EASE = "power1.inOut"

    /*********************************************************
     * Start by hiding all elements
     ********************************************************/

    gsap.set(
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
    const rightCircleElement = svgContainerRef.current?.querySelector(
      "#circle-right .lead-circle"
    )
    const leftCircleElement = svgContainerRef.current?.querySelector(
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

    gsap.set("#circle-right #circle-right-group", {
      x: -moveDistance, // Move left by half distance
    })

    gsap.set("#circle-left #circle-left-group", {
      x: moveDistance, // Move right by half distance
    })

    /*********************************************************
     *  Elements are in place, now show the container
     ********************************************************/

    gsap.set(svgContainerRef.current, {
      autoAlpha: 1,
    })

    /*********************************************************
     *  Now set up drawSVG for the trails
     ********************************************************/

    gsap.set(["#circle-right .lead-circle", "#circle-left .lead-circle"], {
      drawSVG: "0%",
    })

    /*********************************************************
     *  Set the transform origin for the groups
     *  This is needed for the rotation to work
     ********************************************************/

    gsap.set(["#circle-left-group", "#circle-right-group"], {
      transformOrigin: "center",
    })

    gsap.set("#circle-left-group", {
      rotation: 180,
    })

    /*********************************************************
     * Master Timeline with Scroll Control
     ********************************************************/

    const tl = gsap.timeline({
      id: "circles-animation",
      duration: TOTAL_DURATION,
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: sectionRef.current,
        start: "top top",
        end: `+=${PIN_DURATION}`,
        scrub: true,
        anticipatePin: 1,
        markers: true,
      },
    })

    /*********************************************************
     *  Now ready to animate
     ********************************************************/

    tl.to(
      ["#circle-left circle", "#circle-right circle"],
      {
        drawSVG: "0 100%",
        duration: DRAWSVG_DURATION,
        ease: DRAWSVG_EASE,
      },
      DRAWSVG_START_TIME
    )

    tl.to(
      "#circle-left-group, #circle-right-group",
      {
        rotation: `+=${360 * ROTATIONS_DURING_DRAW}`,
        duration: DRAWSVG_DURATION,
        ease: ROTATION_EASE,
      },
      DRAWSVG_START_TIME
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
        ease: CIRCLE_MOVEMENT_EASE,
        // onUpdate: function () {
        //   // Get actual rendered positions
        //   const leftCircle = document.querySelector("#circle-left-group")
        //   const rightCircle = document.querySelector("#circle-right-group")
        //   const transformedX = gsap.getProperty("#circle-left-group", "x")

        //   if (!leftCircle || !rightCircle) return
        //   const leftCircleRect = leftCircle.getBoundingClientRect()
        //   const rightCircleRect = rightCircle.getBoundingClientRect()
        //   // Left circle: reveal trails when circle passes them (moving right)

        //   leftTrailData.forEach(trail => {
        //     if (
        //       leftCircleRect.x + parseFloat(transformedX.toString()) <= trail.x &&
        //       trail.element.getAttribute("data-active") !== "true"
        //     ) {
        //       gsap.to(trail.element, {
        //         autoAlpha: trail.opacity,
        //         duration: TRAIL_FADE_DURATION,
        //         ease: TRAIL_FADE_EASE,
        //       })

        //       trail.element.setAttribute("data-active", "true")
        //     }
        //   })

        //   rightTrailData.forEach(trail => {
        //     if (
        //       rightCircleRect.x - parseFloat(transformedX.toString()) >= trail.x &&
        //       trail.element.getAttribute("data-active") !== "true"
        //     ) {
        //       gsap.set(trail.element, {
        //         autoAlpha: trail.opacity,
        //         duration: TRAIL_FADE_DURATION,
        //         ease: TRAIL_FADE_EASE,
        //       })

        //       trail.element.setAttribute("data-active", "true")
        //     }
        //   })
        // },
      },
      CIRCLES_SPLIT_START
    )

    /*********************************************************
     *  Reveal text and scramble
     ********************************************************/

    tl.to(
      textLeftRef.current,
      {
        autoAlpha: 1,
        duration: TEXT_FADE_DURATION,
        ease: TEXT_FADE_EASE,
      },
      TEXT_APPEAR_TIME
    )

    tl.to(
      textRightRef.current,
      {
        autoAlpha: 1,
        duration: TEXT_FADE_DURATION,
        ease: TEXT_FADE_EASE,
      },
      TEXT_APPEAR_TIME
    )

    // Bottom text fade-in
    tl.to(
      textBottomRef.current,
      {
        autoAlpha: 1,
        duration: TEXT_FADE_DURATION,
        ease: TEXT_FADE_EASE,
      },
      BOTTOM_TEXT_APPEAR_TIME
    )

    // Left text scrambling
    const leftParagraphs = Array.from(textLeftRef.current?.querySelectorAll("p") || [])
    leftParagraphs.forEach((p, index) => {
      tl.to(
        p,
        {
          duration: TEXT_SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "lowerCase",
            newClass: "text-white",
          },
        },
        TEXT_APPEAR_TIME + index * TEXT_END_STAGGER
      )
    })

    // Right text scrambling
    const rightParagraphs = Array.from(textRightRef.current?.querySelectorAll("p") || [])
    rightParagraphs.forEach((p, index) => {
      tl.to(
        p,
        {
          duration: TEXT_SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "lowerCase",
            newClass: "text-white",
          },
        },
        TEXT_APPEAR_TIME + index * TEXT_END_STAGGER
      )
    })

    // Bottom text scrambling
    const bottomParagraphs = Array.from(
      textBottomRef.current?.querySelectorAll("p") || []
    )
    bottomParagraphs.forEach((p, index) => {
      tl.to(
        p,
        {
          duration: BOTTOM_TEXT_SCRAMBLE_DURATION,
          scrambleText: {
            text: "{original}",
            chars: "lowerCase",
            newClass: "text-white",
          },
        },
        BOTTOM_TEXT_APPEAR_TIME + index * TEXT_END_STAGGER
      )
    })

    /*********************************************************
     *  Now reveal the inside
     ********************************************************/

    tl.to(
      "#inside",
      {
        autoAlpha: 1,
        duration: INSIDE_FADE_DURATION,
        ease: INSIDE_FADE_EASE,
      },
      INSIDE_APPEAR_TIME
    )
  })

  return (
    <section className="bg-dark flex min-h-screen items-center" ref={sectionRef}>
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
          <div
            ref={svgContainerRef}
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
        </div>
      </div>
    </section>
  )
}

export default CirclesAnimationComponent

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
