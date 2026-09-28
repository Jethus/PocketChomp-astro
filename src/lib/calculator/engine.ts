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

/**
 * Protein g/kg bodyweight per split, the same for every goal. Mirrors the app's
 * HYBRID_PROTEIN_FACTOR (lib/calculations.ts) — change them together.
 *
 * Sources (primary text checked 2026-09-28):
 * - AND / Dietitians of Canada / ACSM joint position, Nutrition and Athletic
 *   Performance (2016), p.17: intake "generally ranges from 1.2 to 2.0
 *   g/kg/d"; higher only "for short periods ... when reducing energy intake".
 * - ISSN position stand (Jäger et al. 2017), point 2: 1.4–2.0 g/kg/d.
 * - Morton et al., BJSM 2018: no further lean-mass gain "beyond total protein
 *   intakes of 1.62 g/kg/day".
 * - Health Canada DRI (IOM 2005): adult RDA 0.80 g/kg/d, the sedentary floor.
 */
const SPLIT_PROTEIN_FACTOR: Record<MacroSplit, Range> = {
  balanced: { low: 1.2, high: 1.6 },
  high_protein: { low: 1.6, high: 2.0 },
  low_carb: { low: 1.2, high: 1.6 },
  low_fat: { low: 1.2, high: 1.6 },
  // Moderate, not high: excess protein is gluconeogenic and works against
  // ketosis. Keto is defined by its carb cap, not by extra protein.
  keto: { low: 1.2, high: 1.6 },
};

/**
 * Keto is defined by an absolute carbohydrate ceiling (g/day), not a share of
 * calories — a 5% ratio yields 25 g at 2,000 kcal but 44 g at 3,500, only
 * accidentally in range. Carbs are pinned here and fat takes the remainder.
 */
const KETO_CARB_CAP_G = 30;

/**
 * Keto reserves this share of calories for fat before protein is capped, so a
 * very heavy user at the calorie floor still gets a fat-dominant split rather
 * than protein consuming everything above the carb cap. Mirrors
 * KETO_MIN_FAT_SHARE in PocketChomp/lib/calculations.ts.
 */
const KETO_MIN_FAT_SHARE = 0.4;

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
  /**
   * Where the day's burn comes from, in kcal. Sums to the TDEE midpoint.
   * Split for display only — the underlying model is bmr x multiplier, so
   * these are an attribution of that product, not four measured quantities.
   */
  energyBreakdown: {
    bmr: number;
    /** Non-exercise movement: the NEAT multiplier's share above resting. */
    neat: number;
    /** The exercise increment's share. Zero when no training was reported. */
    training: number;
    /** Thermic effect of food — about 10% of intake. */
    digestion: number;
  };
  warning: "aggressive_pace" | null;
}

/** Thermic effect of food: roughly 10% of intake across a mixed diet. */
const TEF_SHARE = 0.1;

/**
 * Weeks to move `deltaKg` at `paceKgPerWeek`, and the date that lands on.
 *
 * Deliberately linear. Real weight loss is not — the rate slows as a smaller
 * body needs fewer calories — so this is an optimistic floor, not a schedule,
 * and the page says so. Returns null when the inputs cannot produce a
 * meaningful projection rather than inventing one.
 */
export function projectGoalDate(
  deltaKg: number,
  paceKgPerWeek: number,
  from = new Date(),
): { weeks: number; date: Date } | null {
  const pace = Math.abs(paceKgPerWeek);
  const delta = Math.abs(deltaKg);
  if (!Number.isFinite(delta) || !Number.isFinite(pace) || pace <= 0 || delta <= 0) {
    return null;
  }
  const weeks = Math.ceil(delta / pace);
  // Beyond a couple of years the linear assumption is worthless.
  if (weeks > 104) return null;
  const date = new Date(from.getTime());
  date.setDate(date.getDate() + weeks * 7);
  return { weeks, date };
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

  // One range per split for every goal: the sources above give a single range,
  // with higher intakes only "for short periods" while cutting.
  const proteinFactor = SPLIT_PROTEIN_FACTOR[split];
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
  const reservedKcal = isKeto
    ? KETO_CARB_CAP_G * 4 + Math.round(macroKcalBase * KETO_MIN_FAT_SHARE)
    : nominalFatG * 9;
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

  // Attribution of the tdee product, not four independent measurements. TEF is
  // carved out first (it scales with intake, not with activity), then what
  // remains above BMR is split between the NEAT base and the exercise
  // increment in proportion to how much each contributed to the multiplier.
  const neatBase = NEAT_MULTIPLIERS[input.activity];
  const exerciseInc =
    EXERCISE_INCREMENTS[sessionsToExerciseBand(input.activeDaysPerWeek)];
  // The clamp can trim the raw sum, so proportions come from the clamped value.
  const neatShareOfRaw = neatBase - 1;
  const rawSplitTotal = neatShareOfRaw + exerciseInc;
  const neatFraction = rawSplitTotal > 0 ? neatShareOfRaw / rawSplitTotal : 1;

  const digestion = Math.round(tdee * TEF_SHARE);
  const activityKcal = Math.max(0, tdee - bmr - digestion);
  const neatKcal = Math.round(activityKcal * neatFraction);
  const trainingKcal = Math.max(0, activityKcal - neatKcal);

  return {
    bmr,
    maintenance,
    target,
    dailyAdjustment,
    energyBreakdown: {
      bmr,
      neat: neatKcal,
      training: trainingKcal,
      digestion,
    },
    proteinG,
    macros: { proteinG: proteinMidG, carbsG, fatG },
    macroPercents: { protein: proteinPct, carbs: carbsPct, fat: fatPct },
    targetKcal: targetMid,
    warning: targetMid < MIN_KCAL[input.sex] ? "aggressive_pace" : null,
  };
}
