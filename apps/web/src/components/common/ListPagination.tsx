"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type PageItem = number | "start-ellipsis" | "end-ellipsis"

function pageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: PageItem[] = [1]
  if (currentPage > 3) pages.push("start-ellipsis")

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let page = start; page <= end; page += 1) pages.push(page)

  if (currentPage < totalPages - 2) pages.push("end-ellipsis")
  pages.push(totalPages)
  return pages
}

export function ListPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const goToPage = (page: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    onPageChange(Math.min(Math.max(page, 1), totalPages))
  }

  return (
    <Pagination className="pt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${Math.max(1, currentPage - 1)}`}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-40" : undefined}
            onClick={goToPage(currentPage - 1)}
          />
        </PaginationItem>

        {pageItems(currentPage, totalPages).map((item) => (
          <PaginationItem key={item}>
            {typeof item === "number" ? (
              <PaginationLink
                href={`?page=${item}`}
                isActive={item === currentPage}
                aria-label={`Go to page ${item}`}
                onClick={goToPage(item)}
              >
                {item}
              </PaginationLink>
            ) : (
              <PaginationEllipsis />
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={`?page=${Math.min(totalPages, currentPage + 1)}`}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-40" : undefined}
            onClick={goToPage(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
