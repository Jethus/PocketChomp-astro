import { describe, it, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculate,
  feetInchesToCm,
  lbsToKg,
} from "./engine";

describe("calculateBMR (Mifflin-St Jeor, matches app lib/calculations.ts)", () => {
  it("male 30y 180cm 80kg = 1780", () => {
    expect(calculateBMR(80, 180, 30, "male")).toBe(1780);
  });
  it("female 25y 165cm 60kg = 1345", () => {
    expect(calculateBMR(60, 165, 25, "female")).toBe(1345);
  });
});

describe("calculateTDEE", () => {
  it("moderate on 1780 = 2759", () => {
    expect(calculateTDEE(1780, "moderate")).toBe(2759);
  });
});

describe("calculate", () => {
  const base = {
    age: 30,
    sex: "male" as const,
    heightCm: 180,
    weightKg: 80,
    activity: "moderate" as const,
  };

  it("maintenance range is TDEE ±10%", () => {
    const r = calculate({ ...base, goal: "maintain", paceKgPerWeek: 0 });
    expect(r.maintenance).toEqual({ low: 2483, high: 3035 });
    expect(r.target).toEqual(r.maintenance);
    expect(r.warning).toBeNull();
  });

  it("lose 0.5 kg/wk shifts band by -550 kcal/day", () => {
    const r = calculate({ ...base, goal: "lose", paceKgPerWeek: 0.5 });
    expect(r.target).toEqual({ low: 1933, high: 2485 });
  });

  it("gain shifts band upward", () => {
    const r = calculate({ ...base, goal: "gain", paceKgPerWeek: 0.25 });
    expect(r.target).toEqual({ low: 2758, high: 3310 });
  });

  it("protein range: lose = 1.6-2.2 g/kg", () => {
    const r = calculate({ ...base, goal: "lose", paceKgPerWeek: 0.5 });
    expect(r.proteinG).toEqual({ low: 128, high: 176 });
  });

  it("protein range: maintain = 1.2-1.6 g/kg", () => {
    const r = calculate({ ...base, goal: "maintain", paceKgPerWeek: 0 });
    expect(r.proteinG).toEqual({ low: 96, high: 128 });
  });

  it("macros sum roughly to target midpoint", () => {
    const r = calculate({ ...base, goal: "lose", paceKgPerWeek: 0.5 });
    const mid = Math.round((r.target.low + r.target.high) / 2);
    const kcal =
      r.macros.proteinG * 4 + r.macros.carbsG * 4 + r.macros.fatG * 9;
    expect(Math.abs(kcal - mid)).toBeLessThanOrEqual(15); // rounding slack
  });

  it("keeps keto fat-dominant for a very heavy user at the calorie floor", () => {
    // Mirrors the app's calculateMacrosHybrid: without a fat reservation,
    // bodyweight protein ate the whole budget above the carb cap.
    const r = calculate({
      age: 40,
      sex: "male",
      heightCm: 180,
      weightKg: 200,
      activity: "sedentary",
      goal: "lose",
      paceKgPerWeek: 1.5,
      split: "keto",
    });
    const kcal = r.macros.proteinG * 4 + r.macros.carbsG * 4 + r.macros.fatG * 9;
    expect((r.macros.fatG * 9) / kcal).toBeGreaterThanOrEqual(0.4);
    expect(r.macros.fatG * 9).toBeGreaterThan(r.macros.carbsG * 4);
  });

  it("flags aggressive pace below the sex-specific floor", () => {
    const r = calculate({
      age: 25,
      sex: "female",
      heightCm: 165,
      weightKg: 60,
      activity: "sedentary",
      goal: "lose",
      paceKgPerWeek: 1.0,
    });
    expect(r.warning).toBe("aggressive_pace");
  });
});

describe("unit conversions", () => {
  it("5ft 10in = 177.8 cm", () => {
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 5);
  });
  it("176.37 lbs ≈ 80 kg", () => {
    expect(lbsToKg(176.37)).toBeCloseTo(80, 2);
  });
});
