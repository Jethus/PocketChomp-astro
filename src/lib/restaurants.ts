/**
 * Restaurant menu data for /restaurants. Every number comes from
 * src/data/restaurants/<slug>.json, written by the app repo's
 * scripts/site/export-restaurant-menus.ts from the live food database, so the
 * page shows exactly what the app logs. Copy quotes items through
 * fillMenu("{Big Mac|calories}"), which fails the build if the item is gone.
 */
export interface MenuItem {
  name: string;
  serving: string;
  calories: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbs: number | null;
  fibre: number | null;
  sugar: number | null;
  protein: number | null;
  sodium: number | null;
}

export interface RestaurantMenu {
  chain: string;
  slug: string;
  exportedAt: string;
  dataUpdatedAt: string;
  itemCount: number;
  sections: { name: string; items: MenuItem[] }[];
}

const files = import.meta.glob<RestaurantMenu>("../data/restaurants/*.json", { eager: true, import: "default" });

export function getMenu(slug: string): RestaurantMenu {
  const menu = Object.values(files).find((m) => m.slug === slug);
  if (!menu) throw new Error(`No menu data for "${slug}" in src/data/restaurants/`);
  return menu;
}

export function sectionId(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type Field = Exclude<keyof MenuItem, "name">;
const FIELDS = new Set<string>(["serving", "calories", "fat", "saturatedFat", "carbs", "fibre", "sugar", "protein", "sodium"]);

/** "{Big Mac|calories}" → "590"; "{count}" → the menu's item count. */
export function fillMenu(text: string, menu: RestaurantMenu): string {
  const items = new Map(menu.sections.flatMap((s) => s.items.map((i) => [i.name, i] as const)));
  return text
    .replaceAll("{count}", String(menu.itemCount))
    .replace(/\{([^{}|]+)\|([a-zA-Z]+)\}/g, (_, name: string, field: string) => {
      const item = items.get(name);
      if (!item) throw new Error(`${menu.chain} copy quotes "${name}", which is not on the menu`);
      if (!FIELDS.has(field)) throw new Error(`Unknown menu field "${field}" in ${menu.chain} copy`);
      const value = item[field as Field];
      if (value === null) throw new Error(`${menu.chain}: "${name}" has no ${field}`);
      return typeof value === "number" ? value.toLocaleString("en-CA") : value;
    });
}
