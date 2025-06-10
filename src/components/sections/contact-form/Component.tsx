import type { ContactFormBlock } from "@/payload/payload-types"
import type { Form as FormType } from "@payloadcms/plugin-form-builder/types"
import { SectionIntro } from "@/components/layout/section-intro"
import { FormBlock } from "@/payload/blocks/form/component"

export const ContactFormComponent: React.FC<ContactFormBlock> = ({
  heading,
  description,
  form,
}) => {
  return (
    <section className="side-border-dark">
      <SectionIntro heading={heading} description={description} />

      {form && typeof form === "object" && (
        <div className="container-sm">
          <FormBlock form={form as FormType} enableIntro={false} />
        </div>
      )}
    </section>
  )
}
