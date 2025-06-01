import { HeaderNavigation } from "@/components/header/nav"
import { getCachedGlobal } from "@/lib/queries/globals"
import type { Header } from "@/payload/payload-types"
import Link from "next/link"

import type { Config } from "payload"
import LogoPrimaryLight from "../logos/logo-light"
import { MobileNav } from "./mobile-nav"

export async function Header() {
  const headerData: Header = await getCachedGlobal(
    "header" as keyof Config["globals"],
    1
  )()

  return (
    <header className="h-nav md:px-section-x bg-dark/40 fixed inset-x-0 top-0 z-[1000] border-b border-white/10 px-0 backdrop-blur-lg">
      <div className="container h-full border-x-1 border-white/10 px-8">
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
