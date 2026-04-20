---
title: "Why I'm building PocketChomp."
description: "Another macro tracker? Really? Yes — because the ones I tried either gated the scanner behind a subscription, didn't exist on Android, or treated my food log like an asset on their balance sheet."
pubDate: "2026-04-16"
tags: ["Philosophy", "Devlog"]
---

I had three apps installed. One wanted $79.99 a year to use its barcode scanner. One didn't exist on Android, so I couldn't actually recommend it to anyone I know. One showed me an ad for a protein powder I'd already rejected three times, in the middle of logging an apple.

Closed all three. Opened a text file. Started typing what I wanted instead.

## The frustration that started it

I'm not a nutritionist. I'm a software person who likes cooking and thinks a lot about what goes into my body. For two years I tried to be a "serious tracker" — weighing food, logging every snack, reviewing my macros weekly. I learned a lot. But I also learned that the apps available in Canada in 2025 were, almost without exception, **built to extract something from me**: money, attention, or data.

The pattern looks like this:

- Free tier is functional enough to hook you. Paid tier is where the *good* search / scanner / AI lives.
- Login required on first launch. No "just let me try it" mode.
- The nutrition database skews American. Canadian packaged foods are missing or wrong.
- Metric is an afterthought. Imperial defaults everywhere.
- If it's iOS-only, it's iOS-only for a reason — and that reason is usually *we bet on one platform and it's not yours*.

> **The thing that finally broke me:** one app wouldn't let me *export* my own logged data without a subscription. Three years of meals, locked behind a paywall. That's the moment I decided to build my own.

## What I actually want from a tracker

I sat down and wrote a list. It's boring. That's the point.

1. Open the app. Log a meal. Close the app. No account required to begin.
2. Voice, barcode, photo, text, OCR, quick-add. I should be able to log how it finds me.
3. Metric by default. Canadian food database priorities. French coming.
4. Works offline. Syncs only if I ask it to.
5. Micronutrients if I want them. Hidden if I don't.
6. My data, exportable at any time, in a format I can actually open (CSV, JSON).
7. One flat price. Not "Pro", "Pro+", "Premium" and "Ultra".
8. On my phone. Both of them. iOS *and* Android.

None of this is novel. It's the absence of it, together, in one product, that's the opening.

## The four pillars I kept coming back to

I pinned these on the wall on day one. Every feature gets tested against them before it ships.

### 1. Privacy is the foundation, not the marketing

Local-first storage. No third-party analytics SDKs — not even the "helpful" ones. The default answer to "should we collect X?" is **no**, and the bar to override that default is *a feature that literally cannot work without it*.

### 2. Respect for people

No ads. Not on the free tier. Not anywhere. Not ever. We sell software — we don't sell you. And no dark-pattern upsells crowding the dashboard while you're trying to figure out dinner.

### 3. Control

Your data lives on your device. You decide if and when it syncs. You can export everything in one tap. You can delete everything in two. The product should feel like a tool you own, not a service you rent.

### 4. Proudly Canadian (and cross-platform)

Built in Toronto. Priced in CAD. Metric first. Android and iOS from day one — because "iOS exclusive" in 2026 mostly means "we couldn't be bothered with half our potential users."

## Why now, and why me

Two things changed in the last 18 months that made this feasible for a solo dev:

1. **On-device inference got cheap enough** to portion food photos without a subscription-funded GPU farm. Gemini Flash + a well-scoped prompt does 95% of what I need at a cost I can absorb.
2. **Expo + Supabase + SQLite** collapsed the iOS/Android/cloud triangle into something one person can actually maintain. I'm not writing two apps. I'm writing one.

I'm the ideal first user: frustrated enough to build it, patient enough to use it daily while it's rough, opinionated enough to *not* add every feature every beta tester asks for. If you're the kind of person who reads software blogs and nods along, you're probably my second or third user.

## What you can expect from this blog

I'm writing in public because the alternative — shipping a quiet little app into the same market the big players already own — doesn't work. Building in public is marketing *and* accountability, at the price of being occasionally embarrassing.

Three kinds of posts:

- **ADRs (Architecture Decision Records).** Why I chose a thing. The tradeoffs. The things I almost chose instead.
- **Prompt anatomy + PRPs (Prompt-Response-Refine).** The actual prompts, the actual failures, the actual fixes. Vibe-coding with receipts.
- **Debug stories.** When something breaks in a beautiful, instructive way, I'll write it up.

Occasionally I'll write something philosophical. This is one of those. Next week: the ADR for local-first. After that: why the Gemini prompt for photo logging has three few-shot examples, not five, not one.

---

*If this resonates — if you also have three abandoned trackers on your phone — I'd love to have you in the beta. It's free. There's no account required to try it. You can export everything you log. You can delete it all with two taps. That's the deal.*
