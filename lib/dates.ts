"use client";

export function formatDisplayDate(date: Date | string) {
  const normalized = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(normalized.getTime())) return "";
  const day = normalized.getDate().toString().padStart(2, "0");
  const month = (normalized.getMonth() + 1).toString().padStart(2, "0");
  const year = normalized.getFullYear().toString();
  return `${day}-${month}-${year}`;
}
