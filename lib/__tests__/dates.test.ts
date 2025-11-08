import { formatDisplayDate } from "@/lib/dates";

describe("formatDisplayDate", () => {
  it("formats Date objects to dd-mm-yyyy", () => {
    const date = new Date("2021-10-22T00:00:00.000Z");
    expect(formatDisplayDate(date)).toBe("22-10-2021");
  });

  it("formats ISO strings", () => {
    expect(formatDisplayDate("2021-03-05T12:00:00.000Z")).toBe("05-03-2021");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatDisplayDate("invalid")).toBe("");
  });
});
