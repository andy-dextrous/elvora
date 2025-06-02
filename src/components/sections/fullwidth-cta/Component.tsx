import type { FullwidthCtaBlock } from "@/payload/payload-types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ArrowRightIcon from "@/components/icons/arrow-right"
import Image from "next/image"
import { Grid, GridLines } from "@/components/layout/grid"
import { Fragment } from "react"

/*************************************************************************/
/*  FULLWIDTH CTA COMPONENT
/*************************************************************************/

export const FullwidthCtaComponent: React.FC<FullwidthCtaBlock> = props => {
  return (
    <section className="relative flex h-screen w-full flex-col justify-center overflow-hidden py-0">
      <div className="relative h-full w-full">
        <Grid className="h-full grid-rows-10">
          <div className="col-span-full row-span-6 row-start-3 flex flex-col justify-center md:col-span-5 md:col-start-2 lg:col-span-5 lg:col-start-2 xl:col-span-3 xl:col-start-2">
            <div className="flex max-w-[500px] flex-col">
              <h2 className="text-white">
                See the Difference
                <br />
                in Minutes
              </h2>
              <p className="mb-8 font-light text-white">
                Watch a fast demo and see how intelligent automation transforms your
                workflow: less effort, more results.
              </p>
              <Button variant="white" size="lg" asChild className="self-start">
                <Link href="/demo">
                  Watch Demo
                  <ArrowRightIcon className="!h-[14px] !w-[24px]" />
                </Link>
              </Button>
            </div>
          </div>
        </Grid>
      </div>

      {/* Background */}
      <Background />
    </section>
  )
}

/*************************************************************************/
/*  BACKGROUND COMPONENT
/*************************************************************************/

const Background = () => {
  return (
    <Fragment>
      <div className="inset-x-section-x absolute top-0 bottom-0">
        <GridLines />
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="relative h-full w-full">
          {/* Background Image */}
          <div className="absolute inset-0 size-full">
            <Image
              src="https://res.cloudinary.com/wild-creative/image/upload/v1748834621/meeting_3_hbtmkr.jpg"
              alt="Escalator Background"
              className="absolute inset-[-10%] h-[110%] w-[110%] object-cover"
              fill
              priority
              quality={100}
              sizes="110vw"
              data-speed="0.8"
            />
          </div>

          <div className="bg-primary/70 absolute inset-0 z-5" />
          <div className="from-secondary-600/80 to-primary-600/60 absolute inset-0 z-5 bg-linear-to-r opacity-80 mix-blend-hard-light" />
          <div className="cta-overlay-depth absolute inset-0 z-6 mix-blend-plus-darker" />
        </div>
      </div>
    </Fragment>
  )
}
