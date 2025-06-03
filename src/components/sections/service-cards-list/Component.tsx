"use client"

import ArrowRightIcon from "@/components/icons/arrow-right"
import MinusIcon from "@/components/icons/minus"
import PlusIcon from "@/components/icons/plus"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import type { ServiceCardsListBlock } from "@/payload/payload-types"
import { gsap, useGSAP, useSmoothContext, ScrollTrigger } from "@/providers/gsap"
import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

/*************************************************************************/
/*  SERVICE CARDS LIST COMPONENT
/*************************************************************************/

const cards = [
  {
    accordionTitle: "Business Intelligence & AI",
    accordionContent: [
      {
        title: "Business Intelligence & AI: From Strategy to Implementation",
        description:
          "We harness the power of your data to uncover actionable insights, drive predictive decision-making, and fuel AI-driven efficiency. Whether you're looking to optimise operations or elevate strategy with smart automation, our BI & AI services turn complexity into clarity.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "Revenue & Profit Optimisation",
    accordionContent: [
      {
        title: "Revenue & Profit Optimisation: Maximizing Business Value",
        description:
          "Strategic solutions to enhance revenue streams and optimize profit margins through data-driven decision making.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "Sales & Marketing Alignment",
    accordionContent: [
      {
        title: "Sales & Marketing Alignment: Unified Growth Strategy",
        description:
          "Align your sales and marketing teams to create seamless customer journeys and drive sustainable growth.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "Lean & Agile Operations",
    accordionContent: [
      {
        title: "Lean & Agile Operations: Efficiency Through Innovation",
        description:
          "Transform your operations with lean methodologies and agile practices to increase efficiency and adaptability.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "Supply Chain Efficiency",
    accordionContent: [
      {
        title: "Supply Chain Efficiency: Optimizing Flow & Control",
        description:
          "Streamline your supply chain operations to reduce costs and improve delivery performance.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "Cloud & Infrastructure",
    accordionContent: [
      {
        title: "Cloud & Infrastructure: Modern Digital Foundation",
        description:
          "Build and maintain scalable, secure cloud infrastructure to support your digital transformation journey.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
  {
    accordionTitle: "CRM & ERP Implementation",
    accordionContent: [
      {
        title: "CRM & ERP Implementation: Integrated Business Systems",
        description:
          "Expert implementation of CRM and ERP solutions to streamline processes and enhance customer relationships.",
        image:
          "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/glass_floor_gbeo9g.jpg",
      },
    ],
  },
] as any

export const ServiceCardsListComponent: React.FC<ServiceCardsListBlock> = props => {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP(() => {
    gsap.effects.titleReveal(titleRef.current, {
      trigger: {
        trigger: titleRef.current,
        start: "top 90%",
        end: "bottom 40%",
      },
    })
  })

  return (
    <section className="side-border-dark pt-section-xl">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-center">
        <h2 ref={titleRef} className="title-hidden">
          Commercial, Operational{" "}
          <span className="text-gradient">& Technology Services</span>
        </h2>
        <p>
          We combine business insight with technical excellence to help leaders accelerate
          transformation. From strategy creation to full-stack implementation, Elvora
          delivers integrated services that unlock growth, margin, and momentum.
        </p>
      </div>
      <div className="border-dark-border w-full border-t">
        <CustomAccordion cards={cards} />
      </div>
      <div className="container-sm mt-section-x">
        <div className="flex items-center justify-between">
          <p>Didn't find what you're looking for? Explore our full capabilities</p>
          <Button asChild>
            <Link href="/services">
              View All Services
              <ArrowRightIcon className="!h-[14px] !w-[24px]" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/*************************************************************************/
/*  ACCORDION COMPONENT
/*************************************************************************/

const CustomAccordion = ({ cards }: { cards: any }) => {
  const { smootherInstance } = useSmoothContext()

  const handleValueChange = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        ScrollTrigger.refresh()

        if (smootherInstance) {
          smootherInstance.refresh()
        }
      }, 300) // Reduced timeout since we're using requestAnimationFrame
    })
  }

  return (
    <Accordion
      type="single"
      defaultValue="item-0"
      collapsible
      className="w-full"
      onValueChange={handleValueChange}
    >
      {cards.map((card: any, index: any) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-dark-border w-full border-b last:border-b"
        >
          {/* Accordion Trigger */}
          <AccordionTrigger className="group gap-content pl-section-x lg:pl-container-md-offset hover:bg-neutral flex w-full items-center justify-start py-6 text-left hover:cursor-pointer hover:no-underline focus-visible:ring-0 lg:py-8 [&>svg]:hidden">
            <span className="center size-8 group-data-[state=open]:hidden">
              <PlusIcon />
            </span>
            <span className="center size-8 group-data-[state=closed]:hidden">
              <MinusIcon />
            </span>
            <h4 className="text-left">{card.accordionTitle}</h4>
          </AccordionTrigger>

          {/* Single Accordion Content containing both text and image */}
          <AccordionContent className="p-0">
            <div className="relative flex w-full flex-col lg:flex-row">
              {/* Text Content */}
              <div className="gap-content lg:pl-container-md-offset lg:pr-section-x pl-section-x pr-section-x pb-section-xs lg:pb-section-x flex w-full flex-col py-20 lg:w-1/2">
                <h3>{card.accordionContent[0].title}</h3>
                <p>{card.accordionContent[0].description}</p>
                <Button className="self-start">Discover {card.accordionTitle}</Button>
              </div>

              {/* Image Content */}
              <div className="absolute top-0 right-0 bottom-0 h-full w-full lg:w-1/2">
                <Image
                  src={card.accordionContent[0].image}
                  alt={card.accordionContent[0].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
