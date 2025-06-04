import type { LatestArticlesBlock } from "@/payload/payload-types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ArrowRightIcon from "@/components/icons/arrow-right"
import Image from "next/image"
import { SectionCta } from "@/components/layout/section-cta"

/*************************************************************************/
/*  STATIC DATA FOR LATEST ARTICLES
/*************************************************************************/

const articles = [
  {
    id: 1,
    title: "The Future of Digital Transformation: Are You Moving Fast Enough?",
    description:
      "In today's hyper-competitive landscape, digital transformation is no longer a choice — it's a necessity. Leading businesses are redefining operations, embracing automation, and leveraging cloud technologies to drive efficiency and innovation.",
    image:
      "https://res.cloudinary.com/wild-creative/image/upload/v1748834618/escalator_tunnel_y2lct0.jpg",
    slug: "future-digital-transformation",
  },
  {
    id: 2,
    title: "From Data to Decisions: Building a Modern Analytics Strategy",
    description:
      "Smart companies don't just collect data — they use it to drive action. Learn how to architect a data strategy that works with your business goals, integrates seamlessly across platforms, and delivers real-time insights for smarter decision-making.",
    image:
      "https://res.cloudinary.com/wild-creative/image/upload/v1748834619/man_seqmxl.jpg",
    slug: "data-to-decisions-analytics-strategy",
  },
  {
    id: 3,
    title: "Scaling with Confidence: IT Infrastructure That Grows with You",
    description:
      "Is your technology stack ready for tomorrow's demands? Explore key considerations when designing scalable IT infrastructure — from cloud-native solutions to hybrid models — and how to future-proof your digital foundation.",
    image:
      "https://res.cloudinary.com/wild-creative/image/upload/v1748834621/man_blur_u9wtu1.jpg",
    slug: "scaling-it-infrastructure",
  },
]

/*************************************************************************/
/*  LATEST ARTICLES COMPONENT
/*************************************************************************/

export const LatestArticlesComponent: React.FC<LatestArticlesBlock> = props => {
  const { text, button } = props

  return (
    <section className="bg-dark side-border-light flicker-mask">
      <div className="container-sm gap-content-lg mb-section-x flex flex-col items-start">
        <h2 className="title-hidden text-white">
          Expert <span className="text-gradient">Insights</span>
        </h2>
        <p className="font-light text-white">
          Stay ahead of the curve: tap into Elvora's ongoing research and field experience
          to navigate rapid technological change with confidence.
        </p>
      </div>
      <div className="border-dark-border w-full border-t">
        <div className="py-section-md container-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {articles.map(article => (
              <article
                key={article.id}
                className="border-light-border flex flex-col border"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden md:mb-6">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="article-image-gradient absolute inset-0" />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
                  <h5 className="mb-3 text-white md:mb-4">{article.title}</h5>
                  <p className="mb-4 flex-1 text-sm font-light text-white/80 md:mb-6">
                    {article.description}
                  </p>
                  <Button
                    variant="outlineGradient"
                    size="md"
                    asChild
                    className="self-start"
                  >
                    <Link href={`/blog/${article.slug}`}>
                      Read More
                      <ArrowRightIcon className="!h-[7px] !w-[12px]" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-section-x">
        <SectionCta text={text} button={button} containerClassName="text-white" />
      </div>
    </section>
  )
}
