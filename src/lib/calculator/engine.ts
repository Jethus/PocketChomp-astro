export type Sex = "male" | "female";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type Goal = "lose" | "maintain" | "gain";
/**
 * Shared vocabulary with the app's DietStyle (PocketChomp/types/wizard).
 * `low_carb` is web-only for now; the app's four are all represented.
 */
export type MacroSplit =
  | "balanced"
  | "high_protein"
  | "low_carb"
  | "low_fat"
  | "keto";

/**
 * Single-factor Harris-Benedict multipliers.
 *
 * Retained only as a reference/fallback. The live path is the NEAT + exercise
 * split below, mirroring PocketChomp/lib/calculations.ts. Kept exported because
 * it documents the envelope the combined multiplier is clamped to.
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Non-exercise activity ("how active are you outside of exercise"), keyed by
 * the same five levels. Lower than ACTIVITY_MULTIPLIERS at the top end because
 * these carry NEAT only — training is added separately below.
 *
 * Ported verbatim from PocketChomp/lib/calculations.ts. Keep in sync.
 */
export const NEAT_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.35,
  moderate: 1.45,
  active: 1.55,
  very_active: 1.65,
};

export type ExerciseFrequencyBand = "none" | "low" | "moderate" | "high";

/** Added to the NEAT multiplier. Bands mirror MacroFactor's sessions/week. */
export const EXERCISE_INCREMENTS: Record<ExerciseFrequencyBand, number> = {
  none: 0,
  low: 0.06, // 1-3 sessions/week
  moderate: 0.15, // 4-6
  high: 0.25, // 7+
};

/** Bounds of the combined multiplier — the familiar Harris-Benedict envelope. */
const MIN_ACTIVITY_MULTIPLIER = 1.2;
const MAX_ACTIVITY_MULTIPLIER = 1.9;

export function sessionsToExerciseBand(
  activeDaysPerWeek: number | null | undefined,
): ExerciseFrequencyBand {
  if (activeDaysPerWeek == null || activeDaysPerWeek <= 0) return "none";
  if (activeDaysPerWeek <= 3) return "low";
  if (activeDaysPerWeek <= 6) return "moderate";
  return "high";
}

/**
 * Combined activity multiplier: a NEAT base plus an exercise increment.
 *
 * Splitting the question is a UX decomposition of PAL, NOT a more accurate
 * model — there is no published equation mapping (NEAT band, exercise
 * frequency) to a PAL, and self-reported PAL carries a 10-20% error against
 * doubly-labeled water regardless of how it is elicited. The gain is that "how
 * often do you train" and "how active are you otherwise" are each easier to
 * answer honestly than one blended question. Do not claim an accuracy
 * improvement from this in site copy.
 *
 * Clamped to the Harris-Benedict envelope so targets stay in the range users
 * see in other apps.
 */
export function calculateActivityMultiplier(
  activityLevel: ActivityLevel,
  activeDaysPerWeek: number | null | undefined,
): number {
  const base = NEAT_MULTIPLIERS[activityLevel];
  const increment = EXERCISE_INCREMENTS[sessionsToExerciseBand(activeDaysPerWeek)];
  return Math.min(
    MAX_ACTIVITY_MULTIPLIER,
    Math.max(MIN_ACTIVITY_MULTIPLIER, base + increment),
  );
}

export const CM_PER_INCH = 2.54;
export const LBS_PER_KG = 2.20462;
const KCAL_PER_KG = 7700;
const MAINTENANCE_BAND = 0.1;
const FAT_KCAL_SHARE = 0.27;
const MIN_KCAL: Record<Sex, number> = { male: 1500, female: 1200 };

/**
 * Fat share of total kcal per split. Protein comes from body weight (g/kg) in
 * every split — carbs take the remainder — so only fat needs a share here.
 * "balanced" holds the original 0.27 so the TDEE and deficit pages, which do
 * not expose a split control, keep returning exactly the numbers they did.
 *
 * Keto's entry is a nominal starting point only: its fat is actually derived
 * from the carb cap below, since a ketogenic diet is defined by an absolute
 * carb ceiling rather than a ratio.
 */
const SPLIT_FAT_SHARE: Record<MacroSplit, number> = {
  balanced: FAT_KCAL_SHARE,
  high_protein: 0.25,
  low_carb: 0.4,
  low_fat: 0.2,
  keto: 0.7,
};

/** Protein g/kg bodyweight per split, before the goal adjustment below. */
const SPLIT_PROTEIN_FACTOR: Record<MacroSplit, Range> = {
  balanced: { low: 1.6, high: 2.2 },
  high_protein: { low: 2.0, high: 2.6 },
  low_carb: { low: 1.6, high: 2.2 },
  low_fat: { low: 1.6, high: 2.2 },
  // Moderate, not high: excess protein is gluconeogenic and works against
  // ketosis, which is why keto is not simply "high protein, high fat".
  keto: { low: 1.4, high: 1.8 },
};

/**
 * Keto is defined by an absolute carbohydrate ceiling (g/day), not a share of
 * calories — a 5% ratio yields 25 g at 2,000 kcal but 44 g at 3,500, only
 * accidentally in range. Carbs are pinned here and fat takes the remainder.
 */
const KETO_CARB_CAP_G = 30;

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
  /**
   * Structured training sessions per week. Feeds the exercise increment, and is
   * asked separately from `activity` on purpose — `activity` carries NEAT only,
   * so a user who answers both is not double-counting their training.
   */
  activeDaysPerWeek?: number | null;
  goal: Goal;
  /** kg per week, absolute value; ignored when goal is "maintain" */
  paceKgPerWeek: number;
  /** Macro distribution; defaults to "balanced" (the original fixed split). */
  split?: MacroSplit;
}

export interface CalculatorResult {
  bmr: number;
  maintenance: Range;
  target: Range;
  /** Signed kcal/day vs maintenance: negative = deficit, positive = surplus */
  dailyAdjustment: number;
  proteinG: Range;
  macros: { proteinG: number; carbsG: number; fatG: number };
  /** Share of total kcal per macro, rounded to whole percents summing to 100 */
  macroPercents: { protein: number; carbs: number; fat: number };
  /** Midpoint of the target range — the kcal the macros are derived from */
  targetKcal: number;
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

export function calculateTDEE(
  bmr: number,
  activity: ActivityLevel,
  activeDaysPerWeek?: number | null,
): number {
  return Math.round(bmr * calculateActivityMultiplier(activity, activeDaysPerWeek));
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const bmr = calculateBMR(
    input.weightKg,
    input.heightCm,
    input.age,
    input.sex,
  );
  const tdee = calculateTDEE(bmr, input.activity, input.activeDaysPerWeek);

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

  // A steep pace on a small body can push the raw arithmetic to or below zero;
  // a negative kcal target is never meaningful, so clamp at zero. The
  // `aggressive_pace` warning is what actually tells the reader not to use it.
  const target: Range = {
    low: Math.max(0, maintenance.low + dailyAdjustment),
    high: Math.max(0, maintenance.high + dailyAdjustment),
  };

  const split = input.split ?? "balanced";

  // Maintaining needs less protein than a deficit (where it protects lean mass)
  // or a surplus. Applied as a shift off each split's own factor rather than a
  // flat 1.2–1.6 override, so the splits keep their relative ordering — a
  // hardcoded override silently flattened balanced, low_carb and low_fat to the
  // same 1.4 g/kg and undercut their intended 1.6 floor.
  const MAINTAIN_PROTEIN_REDUCTION = 0.4;
  const base = SPLIT_PROTEIN_FACTOR[split];
  const proteinFactor =
    input.goal === "maintain"
      ? {
          low: Math.max(1.2, base.low - MAINTAIN_PROTEIN_REDUCTION),
          high: Math.max(1.6, base.high - MAINTAIN_PROTEIN_REDUCTION),
        }
      : base;
  const proteinG: Range = {
    low: Math.round(input.weightKg * proteinFactor.low),
    high: Math.round(input.weightKg * proteinFactor.high),
  };

  const targetMid = Math.round((target.low + target.high) / 2);

  // Macros are split from a floor-guarded figure. An aggressive pace can drive
  // the raw target to (or below) zero, and splitting that leaves protein alone
  // exceeding the budget — carbs clamp at 0 and the "split" stops summing to
  // the calorie total. Below the floor the numbers are not advice worth giving,
  // so derive macros from the floor instead and let `warning` carry the truth.
  const macroKcalBase = Math.max(targetMid, MIN_KCAL[input.sex]);

  // Keto inverts the derivation: carbs are pinned at the ceiling and fat takes
  // whatever is left after protein. Every other split sets fat from its share
  // and lets carbs absorb the remainder.
  const isKeto = split === "keto";

  const nominalFatG = Math.round((macroKcalBase * SPLIT_FAT_SHARE[split]) / 9);
  // Protein is capped so it can never crowd out the rest of the budget: at most
  // the grams that fit alongside fat (or the carb floor, under keto).
  const reservedKcal = isKeto ? KETO_CARB_CAP_G * 4 : nominalFatG * 9;
  const proteinCapG = Math.max(0, Math.floor((macroKcalBase - reservedKcal) / 4));
  const proteinMidG = Math.min(
    Math.round((proteinG.low + proteinG.high) / 2),
    proteinCapG,
  );

  const carbsG = isKeto
    ? Math.min(
        KETO_CARB_CAP_G,
        Math.max(0, Math.floor((macroKcalBase - proteinMidG * 4) / 4)),
      )
    : Math.max(
        0,
        Math.round((macroKcalBase - proteinMidG * 4 - nominalFatG * 9) / 4),
      );

  const fatG = isKeto
    ? Math.max(0, Math.round((macroKcalBase - proteinMidG * 4 - carbsG * 4) / 9))
    : nominalFatG;

  // Percentages come from the gram figures actually shown, so the split the
  // reader sees always reconciles with the grams above it. Rounding each
  // independently can total 99 or 101, so carbs absorb the remainder.
  const macroKcal = proteinMidG * 4 + carbsG * 4 + fatG * 9;
  const proteinPct = macroKcal ? Math.round((proteinMidG * 4 * 100) / macroKcal) : 0;
  const fatPct = macroKcal ? Math.round((fatG * 9 * 100) / macroKcal) : 0;
  const carbsPct = macroKcal ? 100 - proteinPct - fatPct : 0;

  return {
    bmr,
    maintenance,
    target,
    dailyAdjustment,
    proteinG,
    macros: { proteinG: proteinMidG, carbsG, fatG },
    macroPercents: { protein: proteinPct, carbs: carbsPct, fat: fatPct },
    targetKcal: targetMid,
    warning: targetMid < MIN_KCAL[input.sex] ? "aggressive_pace" : null,
  };
}
