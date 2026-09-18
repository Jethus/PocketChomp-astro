---
title: "What's free, what's paid, and where I drew the line"
description: "This week I sat down and decided exactly which features go behind the paywall. Here's the list, the one question I asked about every feature, and the two I'm still not sure about."
pubDate: "2026-09-16"
tags: ["Devlog", "Philosophy"]
---

This week I sat down and figured out exactly which features in PocketChomp to gate behind a paywall. Written down like that it doesn't sound nice. But every app that charges money has to do it, and most of them do it quietly, one feature at a time, until the free version is a demo. I'd rather do it once, in public, and let you hold me to it.

So here's the whole list, and the thinking behind it.

## The one question

For every feature I asked the same thing: if someone left the big calorie counter because it put barcode scanning behind a subscription, would they feel cheated losing this?

If yes, it's free. Forever. Not "free for now", not "free up to 10 a day".

If no, because it's something no tracker ever gave them for free anyway, or because it costs me real money every time it runs, then charging for it is fair.

That's it. That's the whole framework.

## Free, forever

**Barcode scanning, unlimited.** This is the one I care about most. Typing out every single food or ingredient you're using is a pain. Scanning makes it easy. It's integral to an app like this, and it's the exact feature that got paywalled elsewhere. It will never cost anything here.

**Nutrition label scanning.** Same job as the barcode, for anything that isn't in the database yet. Point the camera at the nutrition facts panel and the app reads it, live, and fills in the food for you. A lot of Canadian products from smaller brands aren't in anyone's database. This is how you log them without typing.

**Searching the Canadian catalogue.** The database is the reason the app exists. Locking it up would be pointless.

**Manual entry, custom foods, recipes and meals.** The full logging loop. Nothing in it is crippled.

**Every nutrient.** Macros, and all the micros: fibre, sodium, potassium, iron, vitamins, the lot. Some apps charge for anything past calories and protein. I think that's backwards. If you want to track your cholesterol and nothing else, you can.

**Goals.** Set your own calorie and macro targets, or pick a macro split and let the app work out the grams. On top of that you can run two goals at once, things like "hit 30 g of fibre" or "keep sodium under 2,000 mg", and the diary shows how you're doing against them. Two at a time covers most people. If you want five, that's the paid part.

**Your layout.** The dashboard is yours to arrange. Pin the metrics you care about, drop the ones you don't, and if you don't want to see calories at all, turn them off completely. More on that below.

**No account required.** Guest mode isn't a trial. You can use the app for years without signing up. Paying doesn't even need an account.

**Sync and backup.** Your data being portable is a privacy promise, not an upsell.

**No ads. Ever.** There's no ad inventory, so "remove ads" can never become a paid feature.

**Insights for the recent past.** The weekly calorie chart, your weight history, and food insights for the last 7 and 30 days: which foods are actually driving your sodium, where your protein comes from, what you eat most. Recording plus recent awareness is free. The long-range analysis over months is where the paid tier starts.

**A home-screen widget.** Today's numbers on your home screen without opening the app. That's the daily habit surface, and gating it would be gating the habit.

## What PocketChomp+ is

Everything on the paid side is one of two things. Either it costs me money every time you use it, or it's insight the free apps never had in the first place.

- **Photo and voice logging.** Take a photo of the plate, or say what you ate. This runs through an AI model and I pay per call. The paid tier covers that bill.
- **Recipe import from a URL.** Same reason, same model.
- **Adaptive targets.** The app watches your intake against your actual weight trend and works out what your real maintenance is, instead of trusting a formula. This is the feature the 14-day trial exists for. You need a couple of weeks of data before it has anything to say, so the trial is long enough to actually feel it work.
- **Long-term trends and insights past 30 days.** Recording and recent awareness are free. Computed intelligence over months is paid.
- **More of a few things.** More than two active goals at once. Favourites saved at a specific portion. Quick-log buttons on the widget.

$6.99 a month, $39.99 a year, Canadian dollars. Cancel is silent, restore is a tap.

## The two I'm not sure about

I'll be honest about the ones that felt tricky.

**Favourites.** A free user can favourite any food, but re-logging it goes back to the default serving. Plus remembers the exact portion you had. Favourites feel like something that should be free at all times, and they are. But saving the portion is the bit that slipped to the paid side, and I can see someone reading that as a bait-and-switch. I went with a "maximum" approach: the feature is free, the power-user version costs. If people tell me it feels like a cheat, this is the first thing I'll revisit.

**Goals.** Same shape. Two goals running at once, free. A third needs Plus. Most people run one. Some run five.

I've written down for myself that I won't add another gate of this shape, where a free feature quietly does a bit less, without going back through both of these first.

## How the paid tier shows up

This matters as much as the list. Plenty of apps have a reasonable free tier and still feel awful to use, because the upsell is everywhere.

- A locked feature stays visible. You can see what it does and there's one button to unlock it. It's never hidden to make the "surprise" convert better.
- The paywall appears when you tap a locked thing, or when you open the Plus row in settings. Never on launch. Never after your tenth log. Never on a timer.
- Dismiss means dismiss. It doesn't come back on the next screen.
- No countdowns, no "offer ends soon", no "No thanks, I don't want to reach my goals" button.
- The monthly plan is always visible. No pre-selected annual plan pretending to be the only option.
- Export and delete are never gated. Not behind a subscription, not behind an account.
- What was free the day you installed stays free for you. If I ever move a line, it moves for new installs, not under people already using the app.
- Your logged food is never sold, shared, or "enriched" as a way of making money. Ever.

## No pressure, in either direction

The app has no streaks and no guilt. Go over your target and the number reads "100+% of target". No red, no warning, no "you can still make it back". It logs what you ate and shows you, and that's it. I've seen people close to me struggle with eating disorders, and that's why the option to turn calories off completely exists. If you want to track fibre or cholesterol and see nothing else, you can do exactly that.

## The honest doubt

Is it weird to build a calorie counter with this philosophy? Maybe. Sometimes I think I should have built something about eating well without counting at all. I'd like that to exist as a whole separate mode of the app one day, and I think it will. But counting is what the people I'm building for already do, and they're doing it in apps that charge them for the scanner and show them protein ads while they log an apple. Fixing that first felt more useful than inventing a new category.

The other worry is the market. It's saturated. I think I've carved out a decent corner of it, Canadian groceries, privacy, everything stored on your phone, but there are still a lot of these apps, and curating the data never ends. That's not a reason not to build it. It's a reason to be clear about what I'm promising.

## Why write it down

The risk isn't today's list. Today's list is fine. The risk is two years from now, when there's revenue to protect and someone (probably me) says "what if we just capped scans at twenty a day for free users, as a test". Twenty individually reasonable experiments can add up to exactly the app I built this to get away from.

So this post is the brake. The line is public. If it moves, you'll know, and you'll know why.

The Android beta is open. If you're interested, [sign up for updates below](#signup) and I'll send you the link when the Play Store listing is live.
<!-- When the Play listing goes public, add: or grab it on the Play Store: https://play.google.com/store/apps/details?id=<package> -->
