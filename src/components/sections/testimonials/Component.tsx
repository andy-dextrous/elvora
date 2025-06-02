"use client"

import RichText from "@/payload/components/rich-text"
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

export const TestimonialsComponent: React.FC<TestimonialsBlock> = props => {
  const { heading, content } = props

  return (
    <section className="bg-dark-50 side-border-dark">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2>
          Trusted By <br />
          <span className="text-gradient">Forward-Thinkers</span>
        </h2>
        <p>
          From strategy to execution, our work delivers real-world results—at scale, with
          impact. These are their stories of transformation, growth, and success.
        </p>
      </div>
      <div className="border-dark-border relative w-full border-t">
        <div className="absolute -top-16 right-0 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Button className="testimonials-previous hover:cursor-pointer" icon={true}>
              <ArrowRightIcon className="!h-6 !w-6 rotate-180" />
            </Button>
            <Button
              className="testimonials-next hover:cursor-pointer"
              variant="outlineDark"
              icon={true}
            >
              <ArrowRightIcon className="!h-6 !w-6" />
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
]

/*******************************************************/
/*  Testimonial Slider Component
/*******************************************************/

const TestimonialSlider = () => {
  return (
    <div className="relative h-[400px] w-full">
      <Swiper
        spaceBetween={0}
        slidesPerView={2.5}
        autoplay={{
          delay: 5000,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1.2,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2.2,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 2.2,
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
            <article className="border-dark-border flex h-[400px] flex-col justify-between border-y border-r p-8">
              <div className="mb-8">
                <svg
                  className="text-primary mb-6 h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <blockquote className="text-lg leading-relaxed text-gray-700">
                  {testimonial.quote}
                </blockquote>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <testimonial.LogoComponent className="h-8 w-8" />
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
