import Logomark from "@/components/logos/logomark"

/*************************************************************************/
/*  DEFAULT LOADING COMPONENT
/*************************************************************************/

export default function Loading() {
  return (
    <section className="bg-dark-950 center fixed inset-0 z-50 h-screen w-screen">
      <div className="animate-pulse">
        <Logomark className="h-40 w-auto" />
      </div>
    </section>
  )
}
