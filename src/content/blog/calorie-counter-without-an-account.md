---
title: "A calorie counter you can use without an account"
description: "PocketChomp works with no account, no email and no sign-in. Here is what stays on your phone, what leaves it, and why, one line at a time."
pubDate: "2026-10-25"
tags: ["Privacy"]
faq:
  - q: "Can I use PocketChomp without an account?"
    a: "Yes. Tap Get started, finish setup and you're in. Logging, barcode scanning, goals, recipes and export all work as a guest. An account only adds cloud backup and sync to another phone."
  - q: "Does PocketChomp sell my data?"
    a: "No. There are no ads in the app, and nothing you log is sold, rented or traded. PocketChomp makes its money from PocketChomp+, a subscription."
  - q: "Does PocketChomp work offline?"
    a: "Logging does. Your diary is a database on your phone, along with the Health Canada and USDA food tables and every food you've used before. Searching for a store product you haven't logged yet, or scanning a new barcode, needs a connection."
  - q: "How do I delete my data?"
    a: "As a guest, More, then Delete All Data, wipes it from your phone. Uninstalling does the same. If you signed in, More, then Delete Account, removes it from the server too."
---

You don't need an account to use PocketChomp. No email, no Google sign-in, no "create a password to continue". You tap Get started, set your goals, and start logging. Everything you log is stored on your phone.

I built it that way because every calorie counter I tried wanted an account before it would show me anything. A food diary is a list of everything you ate, every day, with the time. That's more personal than most of what people sign up for, and I didn't think an app should need it on a server just to add up numbers.

## What stays on your phone

All of it, by default. Your diary, your recipes and custom foods, your water and weight, your goals, and the details you enter at setup (height, weight, age, activity level) live in a database on the phone. So do the Health Canada and USDA food tables, and every food you've searched, scanned or logged, which is why logging still works with no signal.

Uninstall the app and it's gone. There is no copy anywhere else unless you make one.

## What leaves your phone, and why

"Nothing ever leaves your phone" would be a nicer sentence, but it isn't true, and I'd rather you know exactly what does. As a guest with usage analytics off, this is the full list:

| What | When | Why |
|---|---|---|
| Your search words | When your phone has fewer than 10 matches for a search | To look through the full food database on my server. The words aren't saved. |
| A barcode number | When you scan a barcode | To find the product. If it's not in my database, the number goes to Open Food Facts. |
| A crash report | When the app crashes | The error, the app version and the phone model. Never your food log. |
| One app-open count | Each time you open the app | A random id made on install, so I know how many people use it. Nothing else rides along. |
| A subscription check | Each time you open the app | RevenueCat, which handles PocketChomp+, checks whether this phone has it. It gets a random id it made itself, not your name or email. |

Like any server, mine sees the internet address of whatever phone is asking. For searches and lookups I keep that address and the time for about a week, so one person can't flood the server, and then it's deleted. It isn't stored with what you searched.

Two Plus features send more, because they can't work otherwise. Photo logging sends the photo to Google's Gemini API to identify the food. Recipe import sends the recipe page you pasted. Neither the photo nor the page is kept. Nutrition-label scanning runs on the phone and the image never leaves it.

## What's off unless you turn it on

| Setting | Default | What it adds |
|---|---|---|
| Usage analytics | Off | Which features get used, food search words, and the text of voice and typed meals (with no name, account or device id attached) |
| Cloud sync | Off until you sign in | A backup of your diary on my server, so a new phone can restore it |
| Health Connect | Off | Steps, workouts and weight read from Android. Read only. |

Signing in is the one that changes the most. Once you have an account, your diary syncs to my database so it survives a lost phone. Your local copy stays where it is. If you never sign in, there's nothing to sync.

## What I don't do

There are no ads in PocketChomp, free or paid, so there's no ad network in the app to share anything with. I don't sell, rent or trade what you log. The app makes money from PocketChomp+, and that's the whole business. Food logging and the barcode scanner aren't part of it, because [the basics are never paywalled](/blog/what-calorie-counters-cost-in-canada).

## Getting your data out, or deleting it

- **Export:** More, then Export Data, gives you your food log as a CSV file. It opens in any spreadsheet.
- **Delete as a guest:** More, then Delete All Data. Or uninstall.
- **Delete with an account:** More, then Delete Account removes your synced data from the server straight away.

## Where it doesn't go far enough yet

Crash reports are always on. I need them to fix what breaks, and they carry no food or profile data, but there isn't a switch for them. Some of the services I use, like the one that handles crash reports and the Gemini API for photos, process data in the United States.

The full detail, including every third party and how long each thing is kept, is on the [privacy page](/privacy). If something on this page and that one ever disagree, that one wins and this one is a bug.

If an app that doesn't need your email sounds right, PocketChomp is in open beta [on Google Play](https://play.google.com/store/apps/details?id=com.pocketchomp.app).
