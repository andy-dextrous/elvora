"use client"

import { useGSAP, gsap } from "@/providers/gsap"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

/*************************************************************************/
/*  GLOBAL ANIMATIONS WRAPPER COMPONENT
/*************************************************************************/

interface GlobalAnimationsProps {
  children: React.ReactNode
}

export const GlobalAnimations: React.FC<GlobalAnimationsProps> = ({ children }) => {
  const pathname = usePathname()

  useGSAP(() => {
    const titleElements = document.querySelectorAll(".title-hidden")

    titleElements.forEach(element => {
      gsap.effects.titleReveal(element, {
        trigger: {
          trigger: element,
          start: "top 90%",
          end: "bottom 40%",
        },
      })
    })
  }, [pathname])

  return <Fragment>{children}</Fragment>
}
