import RichText from "@/payload/components/frontend/rich-text"
import { cn } from "@/utilities/ui"
import parse from "html-react-parser"

/*************************************************************************/
/*  SECTION INTRO COMPONENT
/*************************************************************************/

interface SectionIntroProps {
  heading?: string
  description?: any // Rich text from Payload
  align?: "center" | "start"
  headingClassName?: string
  descriptionClassName?: string
  containerClassName?: string
}

export const SectionIntro: React.FC<SectionIntroProps> = ({
  heading,
  description,
  align = "start",
  headingClassName,
  descriptionClassName,
  containerClassName,
}) => {
  // Parse heading and convert span tags to gradient elements
  const parsedHeading = heading
    ? parse(heading, {
        replace: (domNode: any) => {
          if (domNode.name === "span") {
            return <span className="text-gradient">{domNode.children[0]?.data}</span>
          }
        },
      })
    : null

  if (!heading && !description) return null

  return (
    <div
      className={cn(
        "container-sm gap-content-lg mb-section-x flex flex-col",
        align === "center" ? "items-center" : "items-start",
        containerClassName
      )}
    >
      {heading && (
        <h2 className={cn("title-hidden", headingClassName)}>{parsedHeading}</h2>
      )}

      {description && (
        <RichText
          data={description}
          enableGutter={false}
          textColor="inherit"
          className={cn("w-full", descriptionClassName)}
        />
      )}
    </div>
  )
}
