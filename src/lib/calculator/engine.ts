export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "lose" | "maintain" | "gain";

/** Identical to app repo lib/calculations.ts */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const CM_PER_INCH = 2.54;
export const LBS_PER_KG = 2.20462;
const KCAL_PER_KG = 7700;
const MAINTENANCE_BAND = 0.1;
const FAT_KCAL_SHARE = 0.27;
const MIN_KCAL: Record<Sex, number> = { male: 1500, female: 1200 };

export interface Range {
  low: number;
  high: number;
}

export interface CalculatorInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  /** kg per week, absolute value; ignored when goal is "maintain" */
  paceKgPerWeek: number;
}

export interface CalculatorResult {
  bmr: number;
  maintenance: Range;
  target: Range;
  /** Signed kcal/day vs maintenance: negative = deficit, positive = surplus */
  dailyAdjustment: number;
  proteinG: Range;
  macros: { proteinG: number; carbsG: number; fatG: number };
  warning: "aggressive_pace" | null;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG;
}

/** Mifflin-St Jeor — same formula and rounding as the app */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: Sex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calculateTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const bmr = calculateBMR(
    input.weightKg,
    input.heightCm,
    input.age,
    input.sex,
  );
  const tdee = calculateTDEE(bmr, input.activity);

  const maintenance: Range = {
    low: Math.round(tdee * (1 - MAINTENANCE_BAND)),
    high: Math.round(tdee * (1 + MAINTENANCE_BAND)),
  };

  const signedPace =
    input.goal === "maintain"
      ? 0
      : input.goal === "lose"
        ? -Math.abs(input.paceKgPerWeek)
        : Math.abs(input.paceKgPerWeek);
  const dailyAdjustment = Math.round((signedPace * KCAL_PER_KG) / 7);

  const target: Range = {
    low: maintenance.low + dailyAdjustment,
    high: maintenance.high + dailyAdjustment,
  };

  const proteinFactor =
    input.goal === "maintain"
      ? { low: 1.2, high: 1.6 }
      : { low: 1.6, high: 2.2 };
  const proteinG: Range = {
    low: Math.round(input.weightKg * proteinFactor.low),
    high: Math.round(input.weightKg * proteinFactor.high),
  };

  const targetMid = Math.round((target.low + target.high) / 2);
  const proteinMidG = Math.round((proteinG.low + proteinG.high) / 2);
  const fatG = Math.round((targetMid * FAT_KCAL_SHARE) / 9);
  const carbsG = Math.max(
    0,
    Math.round((targetMid - proteinMidG * 4 - fatG * 9) / 4),
  );

  return {
    bmr,
    maintenance,
    target,
    dailyAdjustment,
    proteinG,
    macros: { proteinG: proteinMidG, carbsG, fatG },
    warning: targetMid < MIN_KCAL[input.sex] ? "aggressive_pace" : null,
  };
}
