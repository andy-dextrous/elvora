import type { InfoGridBlock } from "@/payload/payload-types"
import { SectionIntro } from "@/components/layout/section-intro"
import { tv } from "tailwind-variants"

/*************************************************************************/
/*  COMPONENT VARIANTS
/*************************************************************************/

const sectionVariants = tv({
  base: "",
  variants: {
    backgroundColorScheme: {
      dark: "bg-dark side-border-light",
      light: "bg-light side-border-dark",
    },
  },
})

const borderVariants = tv({
  base: "border-dark-border w-full border-t",
  variants: {
    backgroundColorScheme: {
      dark: "border-light-border",
      light: "border-dark-border",
    },
  },
})

const gridVariants = tv({
  base: "grid",
  variants: {
    gridColumns: {
      "2": "grid-cols-1 sm:grid-cols-2",
      "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  },
})

const cardVariants = tv({
  base: "p-section-sm lg:p-section-md relative flex min-h-[400px] flex-col justify-between border-y border-r last:border-r-0 sm:min-h-[350px] lg:min-h-[400px]",
  variants: {
    backgroundColorScheme: {
      dark: "border-light-border",
      light: "border-dark-border",
    },
  },
})

const textVariants = tv({
  base: "",
  variants: {
    backgroundColorScheme: {
      dark: "text-white",
      light: "text-dark",
    },
  },
})

/*************************************************************************/
/*  INFO GRID COMPONENT
/*************************************************************************/

export const InfoGridComponent: React.FC<InfoGridBlock> = ({
  heading,
  description,
  backgroundColorScheme = "dark",
  gridColumns = "4",
  processSteps,
}) => {
  const textColor = backgroundColorScheme === "dark" ? "text-white" : "text-dark"

  return (
    <section className={sectionVariants({ backgroundColorScheme })}>
      <SectionIntro
        heading={heading}
        description={description}
        align="start"
        headingClassName={textColor}
        descriptionClassName={textColor}
      />

      <div className={borderVariants({ backgroundColorScheme })}>
        <div className={gridVariants({ gridColumns })}>
          {processSteps?.map((step, index) => (
            <div key={index} className={cardVariants({ backgroundColorScheme })}>
              <p className="text-gradient text-h1 absolute top-0 right-0 z-10 px-8 font-light opacity-20">
                {index + 1}
              </p>

              <h3
                className={textVariants({
                  backgroundColorScheme,
                  class: "mb-content-sm",
                })}
              >
                {step.title}
              </h3>
              <p className={textVariants({ backgroundColorScheme, class: "font-light" })}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
