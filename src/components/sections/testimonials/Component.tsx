"use client"

import RichText from "@/payload/components/frontend/rich-text"
import type { TestimonialsBlock } from "@/payload/payload-types"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css/navigation"
import "swiper/css/autoplay"
import "swiper/css"
import { Button } from "@/components/ui/button"
import ArrowRightIcon from "@/components/icons/arrow-right"
import Image from "next/image"
import {
  LogoipLorum,
  LogoipSpanum,
  LogoipGohissum,
} from "@/components/icons/partner-logos"
import Quotation from "@/components/icons/quotation"
import { useGSAP, gsap } from "@/providers/gsap"
import { useRef } from "react"

export const TestimonialsComponent: React.FC<TestimonialsBlock> = props => {
  const { heading, content } = props
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
    <section className="bg-dark-50 side-border-dark">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2 ref={titleRef} className="title-hidden">
          Trusted By <br />
          <span className="text-gradient">Forward-Thinkers</span>
        </h2>
        <p className="max-w-3xl">
          From strategy to execution, our work delivers real-world results—at scale, with
          impact. These are their stories of transformation, growth, and success.
        </p>
      </div>
      <div className="border-dark-border relative w-full border-t">
        <div className="absolute -top-16 right-0 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button className="testimonials-previous hover:cursor-pointer" icon={true}>
              <ArrowRightIcon className="!h-4 !w-4 rotate-180 md:!h-6 md:!w-6" />
            </Button>
            <Button
              className="testimonials-next hover:cursor-pointer"
              variant="outlineDark"
              icon={true}
            >
              <ArrowRightIcon className="!h-4 !w-4 md:!h-6 md:!w-6" />
            </Button>
          </div>
        </div>
        <TestimonialSlider />
      </div>
    </section>
  )
}

/*******************************************************/
/*  Static Testimonials Data
/*******************************************************/

const testimonials = [
  {
    id: 1,
    quote:
      "Sensys didn't just deliver a solution — they helped reshape our entire digital strategy. The clarity and speed were unmatched.",
    name: "Justin Kenter",
    title: "Head of Digital Transformation",
    company: "LumenX",
    LogoComponent: LogoipLorum,
  },
  {
    id: 2,
    quote:
      "From our first workshop to the final rollout, the Sensys team felt like an extension of our own. Reliable, sharp, and truly collaborative.",
    name: "Daniel Ross",
    title: "CTO",
    company: "Vireon Systems",
    LogoComponent: LogoipSpanum,
  },
  {
    id: 3,
    quote:
      "What impressed us most was their ability to simplify complex processes while delivering with confidence.",
    name: "Sarah Chen",
    title: "COO",
    company: "Noventa",
    LogoComponent: LogoipGohissum,
  },
  {
    id: 4,
    quote:
      "Sensys didn't just deliver a solution — they helped reshape our entire digital strategy. The clarity and speed were unmatched.",
    name: "Justin Kenter",
    title: "Head of Digital Transformation",
    company: "LumenX",
    LogoComponent: LogoipLorum,
  },
  {
    id: 5,
    quote:
      "From our first workshop to the final rollout, the Sensys team felt like an extension of our own. Reliable, sharp, and truly collaborative.",
    name: "Daniel Ross",
    title: "CTO",
    company: "Vireon Systems",
    LogoComponent: LogoipSpanum,
  },
  {
    id: 6,
    quote:
      "What impressed us most was their ability to simplify complex processes while delivering with confidence.",
    name: "Sarah Chen",
    title: "COO",
    company: "Noventa",
    LogoComponent: LogoipGohissum,
  },
]

/*******************************************************/
/*  Testimonial Slider Component
/*******************************************************/

const TestimonialSlider = () => {
  return (
    <div className="relative h-[300px] w-full md:h-[350px] lg:h-[400px]">
      <Swiper
        spaceBetween={0}
        slidesPerView={1.2}
        autoplay={{
          delay: 5000,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1.1,
            spaceBetween: 0,
          },
          480: {
            slidesPerView: 1.3,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1.8,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 2.2,
            spaceBetween: 0,
          },
          1200: {
            slidesPerView: 2.5,
            spaceBetween: 0,
          },
        }}
        loop={true}
        modules={[Navigation, Autoplay]}
        navigation={{
          nextEl: ".testimonials-next",
          prevEl: ".testimonials-previous",
        }}
      >
        {testimonials.map(testimonial => (
          <SwiperSlide key={testimonial.id}>
            <article className="border-dark-border flex h-[300px] flex-col justify-between border-r border-b p-4 md:h-[350px] md:p-6 lg:h-[400px] lg:p-8">
              <div className="mb-4 md:mb-6 lg:mb-8">
                <Quotation className="text-primary mb-4 h-12 w-12" />
                <blockquote className="text-h4 font-light">
                  {testimonial.quote}
                </blockquote>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-primary truncate text-xs font-light">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
                <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 md:h-10 md:w-10 lg:h-12 lg:w-12">
                  <testimonial.LogoComponent className="h-4 w-4 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
