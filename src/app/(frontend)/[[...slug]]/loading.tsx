import LogomarkOutline from "@/components/logos/logomark-outline"

/*************************************************************************/
/*  DEFAULT LOADING COMPONENT
/*************************************************************************/

export default function Loading() {
  return (
    <section className="bg-dark-950 center fixed inset-0 z-50 h-screen w-screen">
      <div className="flex flex-col items-center justify-center gap-8">
        <LogomarkOutline width={200} height={330} className="w-auto" />
        <p className="text-primary text-xs font-light tracking-[0.4em] uppercase">
          Loading...
        </p>
      </div>
    </section>
  )
}
