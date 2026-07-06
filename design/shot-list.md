# PocketChomp Site Shot-List

Every image slot on the landing page. To swap an asset: drop the new screenshot in
`src/assets/product/`, update the crop box in `scripts/crop-ui.mjs`, run
`node scripts/crop-ui.mjs`. Components pick up the new crop automatically.

Source screenshots are 1344x2992 (status bar occupies the top ~5.2% — always trim).

| Slot | Component | Current file | Crop source | Aspect | Status | Ideal shot |
| --- | --- | --- | --- | --- | --- | --- |
| Hero phone screen | Hero.astro | ui-dashboard.png | 191845 full, bar trimmed | 9:19.5 | final | Dashboard with a full day logged |
| Hero panel TL | Hero.astro | ui-screen-label.png | 192035 full, bar trimmed | 9:19.5 (cover, top) | final | Label scan of an unmistakably Canadian product |
| Hero panel BL | Hero.astro | ui-screen-search.png | 191905 full, bar trimmed | 9:19.5 (cover, top) | final | Search results with recognizable Canadian brands |
| Hero panel TR | Hero.astro | (green info tile, no image) | — | — | final | Mockup-style "High-contrast nutrient logic" tile; copy in hero.md collageCards |
| Hero panel BR | Hero.astro | (green info tile, no image) | — | — | final | Mockup-style "Canadian database" tile; copy in hero.md collageCards |
| Modular feature phone | ModularFeature.astro (via PhoneFrame) | modular-app-shot.png | legacy asset | 9:19.5 | replace | Re-capture dashboard on current app build to match hero styling |
| Pillar: no ads | ValuePillars.astro (frontmatter) | ui-plate.png | 192156 plate list | 21:9 (cover) | replace | Plate with recognizably Canadian foods, tighter crop on item rows |
| Pillar: your choice | ValuePillars.astro (frontmatter) | ui-search-row.png | 191905 search rows | 21:9 (cover) | replace | Offline indicator visible next to search results if possible |
| Pillar: Canadian | ValuePillars.astro (frontmatter) | ui-label-scan.png | 192035 Neilson label | 21:9 (cover) | replace | Label scan of an unmistakably Canadian product, brand name fully visible |
| Beyond calorie panel | BeyondCalorie.astro (frontmatter) | ui-detailed.png | 191909 detailed nutrition | ~16:9 | final | Optionally re-capture with caffeine/electrolytes rows visible to match copy |
| Phone frames | PhoneFrame.astro / Hero.astro | android-frame-light/dark.png | device frame art | — | final | — |

Not pictured (text-only by design): ProofStrip, Pillar "Privacy", FreePremium,
FieldNotesTeaser, ClosingCTA (phone removed 2026-07-06 — closes on headline + signup
form only), SocialProof (unmounted until real users exist).

Generated but currently unused crops (kept in `scripts/crop-ui.mjs`, free to reuse):
`ui-calories.png`, `ui-macros.png`, `ui-ring.png` (widget extracts from the original
hero collage), `ui-addfood.png` (former closing CTA phone screen),
`ui-screen-library.png`, `ui-screen-plate.png` (former hero TR/BR panels, replaced
by the mockup's green info tiles).

Reserved future slots:
- ProofStrip item 4: Play Store rating (post-launch)
