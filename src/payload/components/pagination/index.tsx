"use client"

import {
	Pagination as PaginationComponent,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../ui/pagination"
import { cn } from "../../utilities/ui"
import { useRouter } from "next/navigation"
import React from "react"

export const Pagination: React.FC<{
	className?: string
	page: number
	totalPages: number
}> = (props) => {
	const router = useRouter()

	const { className, page, totalPages } = props
	const hasNextPage = page < totalPages
	const hasPrevPage = page > 1

	const hasExtraPrevPages = page - 1 > 1
	const hasExtraNextPages = page + 1 < totalPages

	return (
		<div className={cn("my-12", className)}>
			<PaginationComponent>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							size="sm"
							disabled={!hasPrevPage}
							onClick={() => {
								router.push(`/blog/page/${page - 1}`)
							}}
						/>
					</PaginationItem>

					{hasExtraPrevPages && (
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					)}

					{hasPrevPage && (
						<PaginationItem>
							<PaginationLink
								size="sm"
								onClick={() => {
									router.push(`/blog/page/${page - 1}`)
								}}
							>
								{page - 1}
							</PaginationLink>
						</PaginationItem>
					)}

					<PaginationItem>
						<PaginationLink
							isActive
							size="sm"
							onClick={() => {
								router.push(`/blog/page/${page}`)
							}}
						>
							{page}
						</PaginationLink>
					</PaginationItem>

					{hasNextPage && (
						<PaginationItem>
							<PaginationLink
								size="sm"
								onClick={() => {
									router.push(`/blog/page/${page + 1}`)
								}}
							>
								{page + 1}
							</PaginationLink>
						</PaginationItem>
					)}

					{hasExtraNextPages && (
						<PaginationItem>
							<PaginationEllipsis />
						</PaginationItem>
					)}

					<PaginationItem>
						<PaginationNext
							size="sm"
							disabled={!hasNextPage}
							onClick={() => {
								router.push(`/blog/page/${page + 1}`)
							}}
						/>
					</PaginationItem>
				</PaginationContent>
			</PaginationComponent>
		</div>
	)
}
