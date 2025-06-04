import { HeaderNavigation } from "@/components/header/nav"
import { getCachedGlobal } from "@/lib/queries/globals"
import type { Header } from "@/payload/payload-types"
import Link from "next/link"

import type { Config } from "payload"
import LogoPrimaryLight from "../logos/logo-light"
import { MobileNav } from "./mobile-nav"
import { getCurrentUser } from "@/lib/queries/user"
import { cn } from "@/utilities/ui"

export async function Header() {
  const [headerData, user] = await Promise.all([
    getCachedGlobal("header" as keyof Config["globals"], 1),
    getCurrentUser(),
  ])

  return (
    <header
      className={cn(
        "h-nav md:px-section-x bg-dark/40 border-light-border fixed inset-x-0 z-[1000] border-b px-0 backdrop-blur-lg",
        // If user is logged in, add 32px to the top of the header to accomodate the admin bar
        user ? "top-[32px]" : "top-0"
      )}
    >
      <div className="border-light-border h-full border-x-1 px-8">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3"
            aria-label="Return to Elvora homepage"
          >
            <LogoPrimaryLight width={208} height={54} />
          </Link>
          <HeaderNavigation data={headerData} />
          <MobileNav data={headerData} />
        </div>
      </div>
    </header>
  )
}
