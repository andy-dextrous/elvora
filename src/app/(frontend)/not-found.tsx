import Logomark from "@/components/logos/logomark"
import { Button } from "@/components/ui/button"
import Link from "next/link"

/*************************************************************************/
/*  DEFAULT LOADING COMPONENT
/*************************************************************************/

export default function NotFound() {
  return (
    <section className="bg-dark-950 center fixed inset-0 z-50 h-screen w-screen">
      <div className="flex animate-pulse flex-col items-center justify-center gap-4">
        <Logomark className="h-40 w-auto" />
        <p className="text-primary text-xs font-light tracking-[0.4em] uppercase">
          Page Not Found
        </p>
        <Button variant="outlineGradient" asChild>
          <Link href="/">Back Home</Link>
        </Button>
      </div>
    </section>
  )
}
