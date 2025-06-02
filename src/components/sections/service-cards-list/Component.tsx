"use client"

import * as Accordion from "@radix-ui/react-accordion"
import PlusIcon from "@/components/icons/plus"
import MinusIcon from "@/components/icons/minus"
import { Button } from "@/components/ui/button"
import type { ServiceCardsListBlock } from "@/payload/payload-types"
import { cn } from "@/utilities/ui"
import Link from "next/link"
import ArrowRightIcon from "@/components/icons/arrow-right"

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
  return (
    <section className="side-border-dark pt-section-xl">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-center">
        <h2>
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
  return (
    <Accordion.Root type="single" defaultValue="item-0" collapsible>
      {cards.map((card: any, index: any) => (
        <Accordion.Item
          key={index}
          value={`item-${index}`}
          className="border-dark-border hover:bg-neutral !hover:cursor-pointer w-full border-b"
        >
          <div className="flex w-full flex-col lg:flex-row">
            {/* Accordion Content */}
            <div className="flex w-full flex-col items-start lg:w-1/2">
              <Accordion.Header className="w-full">
                <Accordion.Trigger className="group gap-content pl-section-x lg:pl-container-md-offset flex w-full items-center py-6 hover:cursor-pointer data-[state=open]:pt-12 lg:py-8 lg:data-[state=open]:pt-20">
                  <span className="group-data-[state=open]:hidden">
                    <PlusIcon />
                  </span>
                  <span className="group-data-[state=closed]:hidden">
                    <MinusIcon />
                  </span>
                  <h4>{card.accordionTitle}</h4>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="gap-content pb-section-xs pl-section-x pr-section-x lg:pb-section-x lg:pl-container-md-offset lg:pr-section-x flex flex-col data-[state=closed]:hidden">
                <h3>{card.accordionContent[0].title}</h3>
                <p>{card.accordionContent[0].description}</p>
                <Button className="self-start">Discover {card.accordionTitle}</Button>
              </Accordion.Content>
            </div>

            <Accordion.Content className="h-64 w-full data-[state=closed]:hidden md:h-80 lg:h-auto lg:w-1/2">
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${card.accordionContent[0].image})` }}
              />
            </Accordion.Content>
          </div>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
