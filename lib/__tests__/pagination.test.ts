import { buildPaginationRange, clampPage } from "@/lib/pagination";

describe("buildPaginationRange", () => {
  it("returns sequential pages when total is small", () => {
    expect(buildPaginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("adds ellipsis on both sides when needed", () => {
    expect(buildPaginationRange(5, 20)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 20]);
  });

  it("clamps current page into valid range", () => {
    expect(buildPaginationRange(0, 10)).toEqual([1, 2, "ellipsis", 10]);
  });
});

describe("clampPage", () => {
  it("clamps below range", () => {
    expect(clampPage(0, 10)).toBe(1);
  });

  it("clamps above range", () => {
    expect(clampPage(15, 5)).toBe(5);
  });

  it("keeps valid value", () => {
    expect(clampPage(3, 5)).toBe(3);
  });
});
