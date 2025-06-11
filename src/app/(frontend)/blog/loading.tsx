import Logomark from "@/components/logos/logomark"

/*************************************************************************/
/*  DEFAULT LOADING COMPONENT
/*************************************************************************/

export default function Loading() {
  return (
    <section className="bg-dark-950 center fixed inset-0 z-50 h-screen w-screen">
      <div className="flex animate-pulse flex-col items-center justify-center gap-4">
        <Logomark className="h-40 w-auto" />
        <p className="text-primary text-xs font-light tracking-[0.4em] uppercase">
          Loading
        </p>
      </div>
    </section>
  )
}
