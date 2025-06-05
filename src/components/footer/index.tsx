import { getCachedGlobal } from "@/lib/queries/globals"
import { getSettings } from "@/lib/queries/globals"
import { CMSLink } from "@/payload/components/frontend/cms-link"
import { SocialLinks } from "@/payload/components/frontend/social-links"
import LogoPrimaryLight from "@/components/logos/logo-light"
import LogomarkWhite from "@/components/logos/logomark-white"
import type { Footer as FooterType, Setting } from "@/payload/payload-types"
import Link from "next/link"
import type { Config } from "payload"
import LogomarkOutline from "../logos/logomark-outline"

/*************************************************************************/
/*  FOOTER COMPONENT
/*************************************************************************/

export async function Footer() {
  const [footerData, settingsData] = await Promise.all([
    getCachedGlobal("footer" as never, 1),
    getSettings(),
  ])

  const footer = footerData as FooterType
  const settings = settingsData as Setting

  return (
    <footer className="bg-dark side-border-light flicker-mask relative min-h-[60vh] overflow-hidden">
      <div
        className="absolute right-[-150px] bottom-[-100px] z-10 h-[80vh] w-auto"
        data-speed="0.8"
      >
        <LogomarkOutline className="h-full w-full" />
      </div>

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
            <LogoPrimaryLight className="h-16 w-auto" />
          </Link>
        </div>

        {/* Navigation Columns */}
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* CMS Menu Columns */}
          {footer?.menus?.map((menu, index) => (
            <div key={index}>
              <h3 className="mb-6 text-lg font-medium text-white">{menu.title}</h3>
              <ul className="space-y-3">
                {menu.menuItems?.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <CMSLink
                      {...item.link}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Office Locations from Settings */}
          {settings?.locations?.locations?.map((location, index) => (
            <div key={`location-${index}`}>
              <h3 className="mb-6 text-lg font-medium text-white">{location.country}</h3>
              <div className="space-y-2">
                {/* Address with Google Maps Link */}
                {location.street && (
                  <>
                    {location.googleMapsLink ? (
                      <a
                        href={location.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-white/80 transition-colors hover:text-white"
                      >
                        <p>{location.street}</p>
                        {location.city && (
                          <p>
                            {location.city}
                            {location.zip && `, ${location.zip}`}
                          </p>
                        )}
                      </a>
                    ) : (
                      <>
                        <p className="text-sm text-white/80">{location.street}</p>
                        {location.city && (
                          <p className="text-sm text-white/80">
                            {location.city}
                            {location.zip && `, ${location.zip}`}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Phone with tel link */}
                {location.phone && (
                  <a
                    href={`tel:${location.phone}`}
                    className="block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {location.phone}
                  </a>
                )}

                {/* Email with mailto link */}
                {location.email && (
                  <a
                    href={`mailto:${location.email}`}
                    className="block text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {location.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="z-20 flex flex-col space-y-8 border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between md:space-y-0">
          {/* Left Side - Legal Links */}
          <div className="space-y-4">
            {footer?.legals && footer.legals.length > 0 && (
              <div className="flex flex-wrap justify-center space-x-4 text-sm md:justify-start">
                {footer.legals.map((legal, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <CMSLink {...legal.link} className="text-white/80 hover:text-white" />
                    {index < footer.legals!.length - 1 && (
                      <span className="text-white/60">|</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center - Copyright */}
          <div className="text-center">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} {settings?.general?.siteName || "Elvora.info"}{" "}
              | All Rights Reserved
            </p>
          </div>

          {/* Right Side - Social Icons */}
          <SocialLinks
            socialLinks={settings?.social?.socialLinks || []}
            variant="icon-button"
            className="justify-center md:justify-end"
          />
        </div>
      </div>
    </footer>
  )
}
