---
title: "What actually leaves your phone when you use PocketChomp"
description: "I used to say your data never leaves your phone. It wasn't quite true. So the app now keeps a receipt of everything it sends, and you can read it."
pubDate: "2026-11-09"
tags: ["Devlog"]
draft: true
faq:
  - q: "Does PocketChomp send my food diary anywhere?"
    a: "Only if you sign in and turn on backup. Without that, your diary stays on your phone. Some other things do leave, like searches your phone can't answer and crash reports, and the data receipt in Settings shows all of it."
  - q: "Where do I find the data receipt?"
    a: "Settings, then Privacy & Data. The card at the top says what left the phone and where it went. Tap See the full receipt for every request."
---

PocketChomp now keeps a receipt of everything it sends off your phone. It's in Settings › Privacy & Data, and it shows where each request went, what it was for and how big it was.

I built it because writing it down wasn't enough.

## Two things I got wrong

The privacy screen in the app said your data never leaves your phone unless you want it to. Your diary does stay on the phone, but other things leave even for a guest with analytics off: searches your phone can't answer, barcodes, crash reports and a count that the app was opened.

In October I [listed those here](/blog/calorie-counter-without-an-account) and called it the full list. Going through the code request by request, I'd missed one: once a day the app sends the ids of the foods stored on your phone, to check if any of them were corrected. I've added it to that list now.

Neither mistake involved your diary. But both times I was asking you to trust a sentence, and both sentences were wrong when I wrote them. The app also changes every week. A list in a blog post doesn't.

## So the app counts it

Every request the app's own code sends is measured on its way out. Each one becomes a row in a table on your phone: where it went, what it was for, and how many bytes it carried. Never what was in it.

The receipt keeps 30 days, stays on the phone, and is deleted along with the rest of your local data.

The top of the card is one sentence. Here's mine, three days after I installed the update:

> About 742 KB left this phone since Nov 6, 362 KB of it your diary backup.

I'm signed in with backup on, and I share usage analytics, so mine is about as busy as it gets:

| What | Requests | Size |
|---|---:|---:|
| Backup and sync | 171 | 362 KB |
| Usage analytics | 85 | 231 KB |
| Food updates | 39 | 134 KB |
| Foods I shared to the database | 4 | 3.9 KB |
| Food search | 19 | 3.3 KB |
| Barcode lookups | 12 | 1.8 KB |
| Sign-in and account | 14 | 1.5 KB |

The second-biggest line is analytics, which is off unless you turn it on. Take out backup and analytics and mine would be about 150 KB, most of it the daily check for corrected foods. With both off, the headline ends "None of it was your diary."

Below the headline is every place it went, and what for:

- PocketChomp server: Supabase, hosted in Canada
- Analytics (PostHog): crash reports and usage analytics, in the United States
- Open Food Facts: only a barcode my database doesn't have
- Google Gemini (AI): only if you use photo logging or recipe import

Some requests go to my server and get passed on, like a photo going to Gemini. Those come back with a note saying what was forwarded, so the receipt lists "Google Gemini (AI), through our server" as its own line. That's counted before the photo is sent on, so it still shows up if Gemini then fails.

## Off means off

Building the receipt turned up one more thing. With analytics switched off, PostHog still got crash reports and a count each time the app opened. Both were tiny and carried nothing you logged, but the receipt showed a PostHog line right under a switch that said no.

So the app-open count is gone, and crash reports have their own switch next to analytics. Turn both off and the app never talks to PostHog. There's no line for it on the receipt, because there's nothing to count.

## What it can't count

It isn't everything, and the screen says so.

- RevenueCat (subscriptions), app updates, Google Play and Google Sign-In run in native code the receipt can't see. They're listed by name instead.
- Your phone's speech service is listed, but the size of the audio can't be measured.
- The byte count is the request's address and body. Headers, encryption overhead and responses aren't counted.
- It only knows what happened since it started counting. Right after the update it says "since" a date, not "this month".

So it's a receipt, not an audit. But you can check it yourself instead of taking my word for it.

---

The receipt is in the latest version of PocketChomp on [Google Play](https://play.google.com/store/apps/details?id=com.pocketchomp.app). The [privacy page](/privacy) has the full detail. If something on your receipt looks wrong, email me at [josh@pocketchomp.com](mailto:josh@pocketchomp.com).
