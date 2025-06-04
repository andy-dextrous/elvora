import { CMSLink } from "@/payload/components/frontend/cms-link"
import { Button } from "@/components/ui/button"
import { cn } from "@/utilities/ui"
import ArrowRightIcon from "@/components/icons/arrow-right"

/*************************************************************************/
/*  SECTION CTA COMPONENT
/*************************************************************************/

interface SectionCtaProps {
  text?: string
  link?: {
    type?: ("reference" | "custom") | null
    newTab?: boolean | null
    reference?: any | null
    url?: string | null
    label: string
  } | null
  containerClassName?: string
}

export const SectionCta: React.FC<SectionCtaProps> = ({
  text,
  link,
  containerClassName,
}) => {
  if (!text && !link) return null

  return (
    <div
      className={cn(
        "gap-content container-sm flex flex-col items-start space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0",
        containerClassName
      )}
    >
      {text && <p className="text-current">{text}</p>}

      {link && (
        <CMSLink {...link} className="md:shrink-0">
          <Button>
            {link.label}
            <ArrowRightIcon className="!h-[14px] !w-[24px]" />
          </Button>
        </CMSLink>
      )}
    </div>
  )
}
