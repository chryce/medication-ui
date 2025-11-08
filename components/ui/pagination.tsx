"use client";

import { Icon } from "@/components/ui/icon";
import { buildPaginationRange } from "@/lib/pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const paginationRange = buildPaginationRange(currentPage, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <span className="sr-only">Previous page</span>
        <Icon name="chevron-left" />
      </button>
      {paginationRange.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-8 items-center justify-center rounded-full px-3 text-sm text-slate-400"
          >
            ...
          </span>
        ) : (
          <button
            key={`page-${item}`}
            onClick={() => onPageChange(item)}
            className={`flex h-8 min-w-[32px] items-center justify-center rounded-full border px-3 text-sm font-medium ${
              item === currentPage
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 disabled:opacity-40"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="sr-only">Next page</span>
        <Icon name="chevron-right" />
      </button>
    </div>
  );
}
