"use client";

export type PaginationItem = number | "ellipsis";

export function buildPaginationRange(
  currentPage: number,
  totalPages: number,
  maxLength = 7,
): PaginationItem[] {
  const current = clampPage(currentPage, totalPages);
  if (totalPages <= maxLength) {
    return range(1, totalPages);
  }

  const rangeArray: PaginationItem[] = [];
  const siblings = 1;
  const leftSiblingIndex = Math.max(current - siblings, 2);
  const rightSiblingIndex = Math.min(current + siblings, totalPages - 1);

  rangeArray.push(1);

  if (leftSiblingIndex > 2) {
    rangeArray.push("ellipsis");
  }

  for (let page = leftSiblingIndex; page <= rightSiblingIndex; page += 1) {
    rangeArray.push(page);
  }

  if (rightSiblingIndex < totalPages - 1) {
    rangeArray.push("ellipsis");
  }

  rangeArray.push(totalPages);

  return rangeArray;
}

export function clampPage(page: number, totalPages: number) {
  if (Number.isNaN(page) || page < 1) return 1;
  if (page > totalPages) return totalPages;
  return page;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
}
