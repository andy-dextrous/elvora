import RichText from "@/payload/components/rich-text"
import type { TestimonialsBlock } from "@/payload/payload-types"

export const TestimonialsComponent: React.FC<TestimonialsBlock> = props => {
  const { heading, content } = props

  return (
    <section className="bg-dark-50 side-border-dark">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2>
          Trusted By <br />
          <span className="text-gradient">Forward-Thinkers</span>
        </h2>
        <p>
          From strategy to execution, our work delivers real-world results—at scale, with
          impact. These are their stories of transformation, growth, and success.
        </p>
      </div>
      <div className="border-dark-border w-full border-t">
        <div className="container-sm">
          <div className="flex flex-col items-center">
            <h3>Testimonials</h3>
          </div>
        </div>
      </div>
    </section>
  )
}
