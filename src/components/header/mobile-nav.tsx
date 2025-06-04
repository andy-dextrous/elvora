"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { CMSLink } from "@/payload/components/frontend/cms-link"
import type { Header as HeaderType } from "@/payload/payload-types"
import { FaFacebook, FaLinkedin, FaTwitter } from "react-icons/fa"
import Link from "next/link"
import * as React from "react"
import { Hamburger } from "./hamburger"
import LogoPrimaryLight from "../logos/logo-light"
import LogomarkOutline from "../logos/logomark-outline"

/*************************************************************************/
/*  MOBILE NAVIGATION WITH SHEET AND CUSTOM HAMBURGER
/*************************************************************************/

export const MobileNavUpdated: React.FC<{ data: HeaderType }> = ({ data }) => {
  const [open, setOpen] = React.useState(false)
  const navItems = data?.navItems || []

  function handleLinkClick() {
    setOpen(false)
  }

  function handleToggle() {
    setOpen(!open)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Hamburger isOpen={open} onClick={handleToggle} />
      <SheetContent
        side="left"
        className="bg-dark border-light-border fixed inset-y-0 left-0 z-[1000] h-full w-[80%] border-r p-0 lg:hidden"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden">
          <div className="px-section-x py-section-y flex-1 overflow-y-auto">
            <nav className="flex h-full flex-col space-y-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>

              <div className="flex flex-1 flex-col justify-center gap-6">
                {navItems.map(({ item }, i: number) => {
                  if (item?.hasDropdown && item?.subItems && item?.subItems?.length > 0) {
                    return (
                      <div key={i} className="space-y-4">
                        <h3 className="text-white">{item.link?.label}</h3>
                        <div className="flex flex-col space-y-3 pl-4">
                          {item.subItems.map((childItem, j: number) => {
                            const child = childItem.child
                            if (
                              child.hasChildren &&
                              child.subItems &&
                              child.subItems.length > 0
                            ) {
                              return (
                                <div key={j} className="space-y-2">
                                  <h4 className="text-white/90">{child.link?.label}</h4>
                                  <div className="flex flex-col space-y-2 pl-3">
                                    {child.subItems.map((subItem, k: number) => (
                                      <CMSLink
                                        key={k}
                                        {...subItem.link}
                                        className="text-white/70 transition-colors hover:text-white"
                                        onClick={handleLinkClick}
                                      >
                                        {subItem.link?.label}
                                      </CMSLink>
                                    ))}
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div key={j}>
                                <CMSLink
                                  {...child.link}
                                  className="text-white/80 transition-colors hover:text-white"
                                  onClick={handleLinkClick}
                                >
                                  {child.link?.label}
                                </CMSLink>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <CMSLink
                        key={i}
                        {...item.link}
                        className="!text-h6 font-light text-white transition-colors"
                        onClick={handleLinkClick}
                      >
                        {item.link?.label}
                      </CMSLink>
                    )
                  }
                })}
              </div>
            </nav>

            <div className="absolute right-0 bottom-[-100px] h-[80vh] w-auto">
              <LogomarkOutline className="h-auto w-full" />
            </div>
          </div>

          <div className="border-t border-white/10 p-6">
            <div className="flex flex-col gap-4 text-white/60">
              <SheetDescription className="text-center text-sm text-white/60">
                © {new Date().getFullYear()} Elvora. All rights reserved.
              </SheetDescription>
              <div className="flex justify-center gap-4">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                >
                  <FaLinkedin className="from-secondary-600 to-primary-500 h-4 w-4 bg-gradient-to-r bg-clip-text text-transparent transition-all" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                >
                  <FaTwitter className="from-secondary-600 to-primary-500 h-4 w-4 bg-gradient-to-r bg-clip-text text-transparent transition-all" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110"
                >
                  <FaFacebook className="from-secondary-600 to-primary-500 h-4 w-4 bg-gradient-to-r bg-clip-text text-transparent transition-all" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
