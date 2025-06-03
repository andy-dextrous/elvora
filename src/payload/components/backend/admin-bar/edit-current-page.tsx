"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function EitCurrentPage() {
	const [metaData, setMetaData] = useState<any>(null)

	useEffect(() => {
		const getDataAttributes = () => {
			const main = document.querySelector("main")

			const dataAttributes = main?.dataset
			const id = main?.dataset.id
			const collection = main?.dataset.collection
			const singleType = main?.dataset.singleType

			if (dataAttributes && id && collection && singleType) {
				setMetaData({
					id,
					collection,
					singleType,
				})
			}
		}

		getDataAttributes()
	}, [])

	return metaData ? (
		<div>
			<Link
				href={`${process.env.NEXT_PUBLIC_URL}/admin/collections/${metaData?.collection}/${metaData?.id}/preview`}
				className="admin-bar__edit-link"
			>
				Edit {metaData?.singleType}
			</Link>
		</div>
	) : null
}
