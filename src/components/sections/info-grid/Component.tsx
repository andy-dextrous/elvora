import type { InfoGridBlock } from "@/payload/payload-types"

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
          We combine business insight with technical excellence to help leaders accelerate
          transformation. From strategy creation to full-stack implementation, Elvora
          delivers integrated services that unlock growth, margin, and momentum.
        </p>
      </div>
    </section>
  )
}
