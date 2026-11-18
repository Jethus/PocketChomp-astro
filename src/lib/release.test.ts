import { describe, expect, it } from "vitest";
import { isLive, torontoDay } from "./release";

describe("isLive", () => {
  // 03:30 UTC on the 21st is still 22:30 on the 20th in Toronto.
  const lateEvening = new Date("2026-11-21T03:30:00Z");

  it("uses the Toronto calendar day, not UTC", () => {
    expect(torontoDay(lateEvening)).toBe("2026-11-20");
  });

  it("goes live on its date and stays live", () => {
    expect(isLive(new Date("2026-11-20"), lateEvening)).toBe(true);
    expect(isLive(new Date("2026-11-01"), lateEvening)).toBe(true);
  });

  it("holds a page dated tomorrow", () => {
    expect(isLive(new Date("2026-11-21"), lateEvening)).toBe(false);
  });

  it("treats an undated page as live", () => {
    expect(isLive(undefined, lateEvening)).toBe(true);
  });
});
