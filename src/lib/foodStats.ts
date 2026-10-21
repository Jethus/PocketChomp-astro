/**
 * The food-database numbers the site prints, from src/data/food-database.json.
 * That file is written by the app repo's scripts/site/count-food-database.ts
 * from production; re-run it after an import and rebuild. Published figures are
 * rounded DOWN to the nearest 1,000, so a re-count changes the site only when a
 * thousand is crossed, and the site never claims more than the database holds.
 */
import stats from "../data/food-database.json";

export interface SourceCount {
  name: string;
  count: number;
}

const floorThousand = (n: number) => Math.floor(n / 1000) * 1000;
const format = (n: number) => n.toLocaleString("en-CA");

export const foodStats = stats;

/** e.g. "140,000": use as "{foods}+" or "over {foods}". */
export const foodsFigure = format(floorThousand(stats.total));
export const canadianFoodsFigure = format(floorThousand(stats.canadian));

/** "October 21, 2026", the day the counts were taken. */
export const countedOn = new Date(`${stats.countedAt}T12:00:00Z`).toLocaleDateString("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** Exact counts for the database page's tables. */
export const formatCount = format;

/** Fills {foods} and {canadianFoods} in content copy. */
export function fillFoodStats(text: string): string {
  return text.replaceAll("{foods}", foodsFigure).replaceAll("{canadianFoods}", canadianFoodsFigure);
}
