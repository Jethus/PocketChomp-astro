# PocketChomp Site Shot-List

Every image slot on the landing page. To swap an asset: drop the new screenshot in
`src/assets/product/`, update the crop box in `scripts/crop-ui.mjs`, run
`node scripts/crop-ui.mjs`. Components pick up the new crop automatically.

Source screenshots are 1344x2992 (status bar occupies the top ~5.2% — always trim).

| Slot | Component | Current file | Crop source | Aspect | Status | Ideal shot |
| --- | --- | --- | --- | --- | --- | --- |
| Hero phone screen | Hero.astro | ui-dashboard.png | 191845 full, bar trimmed | 9:19.5 | final | Dashboard with a full day logged |
| Hero panel TL | Hero.astro | ui-calories.png | 191845 calories card | ~5:2 | final | — |
| Hero panel BL | Hero.astro | ui-macros.png | 191845 macros card | ~5:2 | final | — |
| Hero panel TR | Hero.astro | ui-ring.png | 191909 kcal ring | ~3:2 | final | — |
| Hero panel BR | Hero.astro | ui-search-row.png | 191905 search rows | ~7:2 | final | — |
| Modular feature phone | ModularFeature.astro (via PhoneFrame) | modular-app-shot.png | legacy asset | 9:19.5 | replace | Re-capture dashboard on current app build to match hero styling |
| Pillar: no ads | ValuePillars.astro (frontmatter) | ui-plate.png | 192156 plate list | 21:9 (cover) | replace | Plate with recognizably Canadian foods, tighter crop on item rows |
| Pillar: your choice | ValuePillars.astro (frontmatter) | ui-search-row.png | 191905 search rows | 21:9 (cover) | replace | Offline indicator visible next to search results if possible |
| Pillar: Canadian | ValuePillars.astro (frontmatter) | ui-label-scan.png | 192035 Neilson label | 21:9 (cover) | replace | Label scan of an unmistakably Canadian product, brand name fully visible |
| Beyond calorie panel | BeyondCalorie.astro (frontmatter) | ui-detailed.png | 191909 detailed nutrition | ~16:9 | final | Optionally re-capture with caffeine/electrolytes rows visible to match copy |
| Closing CTA phone | ClosingCTA.astro (via PhoneFrame) | ui-addfood.png | 191909 full, bar trimmed | 9:19.5 | replace | A "moment of delight" screen — logged day complete, or label scan mid-flight |
| Phone frames | PhoneFrame.astro / Hero.astro | android-frame-light/dark.png | device frame art | — | final | — |

Not pictured (text-only by design): ProofStrip, Pillar "Privacy", FreePremium,
FieldNotesTeaser, SocialProof (unmounted until real users exist).

Reserved future slots:
- ProofStrip item 4: Play Store rating (post-launch)
