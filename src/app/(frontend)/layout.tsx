import Providers from "@/providers"
import React from "react"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getSettings } from "@/lib/queries/globals"
import { getCurrentUser } from "@/lib/queries/user"
import { WildChildAdminBar } from "@/payload/components/admin-bar"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"
import parse from "html-react-parser"
import { draftMode } from "next/headers"

import "./css/globals.css"

export async function generateMetadata() {
  const settings = await getSettings()

  return {
    description: settings.general?.siteDescription || "Wild Child",
    title: settings.general?.siteName || "Wild Child",
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [{ isEnabled }, settings, user] = await Promise.all([
    draftMode(),
    getSettings(),
    getCurrentUser(),
  ])

  const { integrations } = settings

  /*******************************************************/
  /* Get Site Settings
  /*******************************************************/

  const gtmId = integrations?.googleTagManager
  const gaId = integrations?.googleAnalytics
  const head = integrations?.head
  const bodyEnd = integrations?.bodyEnd

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        {gtmId && <link href="https://www.googletagmanager.com" rel="preconnect" />}
        {gaId && <link href="https://www.google-analytics.com" rel="preconnect" />}
        <link rel="stylesheet" href="https://use.typekit.net/lth5ndr.css" />
        {head && parse(head)}
      </head>

      <body className={user ? "relative !pt-[32px]" : ""}>
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Providers>
          <WildChildAdminBar preview={isEnabled} user={user} settings={settings} />

          <Header />

          <div id="smooth-wrapper">
            <div id="smooth-content">
              {children}
              <Footer />
            </div>
          </div>

          {bodyEnd && parse(bodyEnd)}
        </Providers>
      </body>
    </html>
  )
}
