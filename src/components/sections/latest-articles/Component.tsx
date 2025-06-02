import type { LatestArticlesBlock } from "@/payload/payload-types"

/*************************************************************************/
/*  LATEST ARTICLES COMPONENT
/*************************************************************************/

export const LatestArticlesComponent: React.FC<LatestArticlesBlock> = props => {
  return (
    <section className="bg-dark side-border-light flicker-mask">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2 className="text-white">
          Expert
          <br />
          <span className="text-gradient">Insights</span>
        </h2>
        <p className="font-light text-white">
          Stay ahead of the curve: tap into Elvora’s ongoing research and field experience
          to navigate rapid technological change with confidence.
        </p>
      </div>
      <div className="border-dark-border w-full border-t"></div>
    </section>
  )
}
