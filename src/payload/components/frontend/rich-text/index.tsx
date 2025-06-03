import { MediaBlock } from "../../../blocks/media/Component"
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from "@payloadcms/richtext-lexical"
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from "@payloadcms/richtext-lexical/react"

import { CodeBlock, CodeBlockProps } from "../../../blocks/code/Component"

import { cn } from "@/utilities/ui"
import "./styles.scss"

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<any | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== "object") {
    throw new Error("Expected value to be an object")
  }
  const slug = value.slug
  return relationTo === "posts" ? `/blog/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-span-3 col-start-1"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        "payload-richtext !prose",
        {
          "payload-richtext--container": enableGutter,
          "payload-richtext--full-width": !enableGutter,
          "payload-richtext--prose": enableProse,
        },
        className
      )}
      {...rest}
    />
  )
}
