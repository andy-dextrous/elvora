"use client"

import { Header } from "@/payload/payload-types"
import { RowLabelProps, useRowLabel } from "@payloadcms/ui"

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NonNullable<Header["navItems"]>[number]>()

  const label = data?.data?.item?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ""}: ${data?.data?.item?.link?.label}`
    : "Row"

  return <div>{label}</div>
}
