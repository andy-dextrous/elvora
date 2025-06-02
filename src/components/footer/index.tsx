import { getCachedGlobal } from "@/lib/queries/globals"
import { CMSLink } from "@/payload/components/cms-link"
import LogoPrimaryLight from "@/components/logos/logo-light"
import LogomarkWhite from "@/components/logos/logomark-white"
import type { Footer } from "@/payload/payload-types"
import Link from "next/link"
import type { Config } from "payload"
import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaEnvelope,
} from "react-icons/fa"
import { IoChatbubbleEllipsesOutline } from "react-icons/io5"
import LogomarkOutline from "../logos/logomark-outline"

/*************************************************************************/
/*  STATIC FOOTER DATA
/*************************************************************************/

const footerData = {
  services: [
    "Business Intelligence & AI",
    "Revenue & Profit Optimization",
    "Sales & Marketing Alignment",
    "Lean & Agile Operations",
    "Supply Chain Efficiency",
    "Cloud & Infrastructure",
    "CRM/ERP Implementation",
  ],
  company: ["Who We Are", "What We Do", "Insights", "Our Model", "Testimonials"],
  contactAustralia: {
    title: "Australia",
    address: "123 Innovation Drive Level 5, TechWorks Tower",
    postcode: "AUS, SW1A 1AA",
  },
  socialLinks: [
    { name: "Instagram", url: "#", icon: "instagram" },
    { name: "LinkedIn", url: "#", icon: "linkedin" },
    { name: "Facebook", url: "#", icon: "facebook" },
    { name: "YouTube", url: "#", icon: "youtube" },
    { name: "Email", url: "#", icon: "email" },
    { name: "Chat", url: "#", icon: "chat" },
  ],
}

/*************************************************************************/
/*  SOCIAL ICON COMPONENT
/*************************************************************************/

function SocialIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "instagram":
      return <FaInstagram className={className} />
    case "linkedin":
      return <FaLinkedin className={className} />
    case "facebook":
      return <FaFacebook className={className} />
    case "youtube":
      return <FaYoutube className={className} />
    case "email":
      return <FaEnvelope className={className} />
    case "chat":
      return <IoChatbubbleEllipsesOutline className={className} />
    default:
      return null
  }
}

/*************************************************************************/
/*  FOOTER COMPONENT
/*************************************************************************/

export async function Footer() {
  return (
    <footer className="bg-dark side-border-light flicker-mask relative overflow-hidden">
      {/* Background Spotlights */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Spotlight 1 - Royal Purple Spotlight */}
        <div className="bg-primary/30 lg:bg-primary/40 absolute -bottom-[50%] -left-[370px] z-5 h-[400px] w-[400px] blur-[350px]" />

        {/* Spotlight 2 - Chrysler Blue Spotlight */}
        <div className="bg-secondary/30 lg:bg-secondary/60 absolute -right-[180.43px] -bottom-[405.61px] z-5 h-[600px] w-[495.05px] -rotate-[15deg] blur-[350px]" />
      </div>

      {/* <LogomarkOutline className="absolute bottom-0 left-0 z-0" /> */}

      <div className="relative z-10 container px-12 py-16">
        {/* Logo Row - Larger and spans full width */}
        <div className="pb-16">
          <Link href="/" className="block">
            <LogoPrimaryLight className="h-20 w-auto" />
          </Link>
        </div>

        {/* Navigation Columns */}
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Services Column */}
          <div>
            <h3 className="mb-6 text-lg font-medium text-white">Services</h3>
            <ul className="space-y-3">
              {footerData.services.map((service, index) => (
                <li key={index}>
                  <Link
                    href={`/services/${service.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-6 text-lg font-medium text-white">Company</h3>
            <ul className="space-y-3">
              {footerData.company.map((item, index) => (
                <li key={index}>
                  <Link
                    href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Australia Contact - First Instance */}
          <div>
            <h3 className="mb-6 text-lg font-medium text-white">
              {footerData.contactAustralia.title}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-white/80">
                {footerData.contactAustralia.address}
              </p>
              <p className="text-sm text-white/80">
                {footerData.contactAustralia.postcode}
              </p>
            </div>
          </div>

          {/* Australia Contact - Second Instance */}
          <div>
            <h3 className="mb-6 text-lg font-medium text-white">
              {footerData.contactAustralia.title}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-white/80">
                {footerData.contactAustralia.address}
              </p>
              <p className="text-sm text-white/80">
                {footerData.contactAustralia.postcode}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col space-y-8 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between md:space-y-0">
          {/* Left Side - Legal Links */}
          <div className="space-y-4">
            <div className="flex space-x-4 text-sm">
              <Link href="/privacy-policy" className="text-white/80 hover:text-white">
                Privacy policy
              </Link>
              <span className="text-white/60">|</span>
              <Link href="/cookies-policy" className="text-white/80 hover:text-white">
                Cookies Policy
              </Link>
            </div>
          </div>

          {/* Center - Copyright */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              ©2024 Elvora.info All Rights Reserved
            </p>
          </div>

          {/* Right Side - Social Icons */}
          <div className="flex space-x-4 md:justify-end">
            {footerData.socialLinks.map((social, index) => (
              <Link
                key={index}
                href={social.url}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:text-white"
                aria-label={social.name}
              >
                <SocialIcon type={social.icon} className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
