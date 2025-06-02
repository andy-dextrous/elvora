import type { InfoGridBlock } from "@/payload/payload-types"

/*************************************************************************/
/*  STATIC DATA FOR INFO GRID CARDS
/*************************************************************************/

const processSteps = [
  {
    number: "1",
    title: "Discover",
    description:
      "We begin with deep listening and immersion into your business to understand your goals, challenges, and potential.",
  },
  {
    number: "2",
    title: "Strategize",
    description:
      "Together, we frame outcomes and align priorities, designing a roadmap that balances ambition with precision.",
  },
  {
    number: "3",
    title: "Build",
    description:
      "Through our hybrid teams, we execute solutions that fuse strategy with smart technology.",
  },
  {
    number: "4",
    title: "Elevate",
    description:
      "We continuously optimize and adapt, ensuring every solution evolves with your business and delivers sustained value.",
  },
]

/*************************************************************************/
/*  INFO GRID COMPONENT
/*************************************************************************/

export const InfoGridComponent: React.FC<InfoGridBlock> = props => {
  return (
    <section className="bg-dark side-border-light">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2 className="text-white">
          How We Turn
          <br />
          <span className="text-gradient">Strategy Into Results</span>
        </h2>
        <p className="font-light text-white">
          Our five-step model helps you move from insight to execution with clarity and
          confidence. Whether it's AI, operations, or cloud, we tailor solutions that
          scale and evolve with your business.
        </p>
      </div>
      <div className="border-dark-border w-full border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, index) => (
            <div
              key={index}
              className="border-light-border p-section-sm lg:p-section-md relative flex min-h-[400px] flex-col justify-between border-y border-r last:border-r-0 sm:min-h-[350px] lg:min-h-[400px]"
            >
              <p className="text-gradient text-h1 absolute top-0 right-0 z-10 px-8 font-light opacity-20">
                {step.number}
              </p>

              <h3 className="mb-content-sm text-white">{step.title}</h3>
              <p className="font-light text-white">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
