"use client"

import * as Accordion from "@radix-ui/react-accordion"
import PlusIcon from "@/components/icons/plus"
import MinusIcon from "@/components/icons/minus"
import { Button } from "@/components/ui/button"
import type { ServiceCardsListBlock } from "@/payload/payload-types"
import { cn } from "@/utilities/ui"

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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
        image: "https://picsum.photos/1080/1080",
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
          <div className="container-md gap-section-x flex">
            {/* Accordion Content */}
            <div className="gap-content-lg flex w-1/2 flex-col items-start">
              <Accordion.Header className="w-full">
                <Accordion.Trigger className="group gap-content flex w-full items-center py-8 data-[state=open]:py-20">
                  <span className="group-data-[state=open]:hidden">
                    <PlusIcon />
                  </span>
                  <span className="group-data-[state=closed]:hidden">
                    <MinusIcon />
                  </span>
                  <h4>{card.accordionTitle}</h4>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content className="gap-content flex flex-col data-[state=closed]:hidden">
                <h3>{card.accordionContent[0].title}</h3>
                <p>{card.accordionContent[0].description}</p>
                <Button className="self-start">Discover {card.accordionTitle}</Button>
              </Accordion.Content>
            </div>

            {/* Accordion Image - Only show when open */}
            <Accordion.Content className="h-auto w-1/2 data-[state=closed]:hidden">
              <div
                className="h-full w-full"
                style={{ backgroundImage: `url(${card.accordionContent[0].image})` }}
              />
            </Accordion.Content>
          </div>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
