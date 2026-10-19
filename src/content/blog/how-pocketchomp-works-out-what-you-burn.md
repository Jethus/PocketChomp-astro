---
title: "How PocketChomp works out what you actually burn"
description: "The plain version of Dynamic TDEE: why the setup formula is only a guess, how the app learns from your food and weight, why it moves slowly on purpose, and how I check it against what the scale actually did."
pubDate: "2026-10-19"
tags: ["Guide", "Devlog"]
draft: true
faq:
  - q: "How does PocketChomp estimate my maintenance calories?"
    a: "It starts with the Mifflin-St Jeor formula and your activity answers. After that, once a week, it compares what you logged with how your trend weight moved and works backward to what you burned. The formula is only the first guess."
  - q: "Do I need to log my workouts?"
    a: "No. The weekly check-in only reads the food you logged and your weigh-ins. If you train more, your weight trend shows it, and the estimate follows."
  - q: "What happens if I miss a day of logging?"
    a: "A day with nothing logged is left out, not counted as zero. Your estimate is based on the days you did log. You can also mark a day as complete or leave it out yourself."
---

Between May and August this year, I averaged 2,298 kcal a day on the days I fully logged, and my weight dropped 2.33 kg over 98 days. Work that through by hand and it says I burned about 2,480 a day. PocketChomp's estimate, which I never had to work out myself, was 2,466. I only fully logged 42 of those 98 days.

PocketChomp works out what you burn by comparing the food you log with what your weight does, once a week, and working backward. The formula you fill in at setup is only the first guess. After a few weeks your own numbers take over. The feature is called Dynamic TDEE, and this post is the plain version of how it works and how I check it.

## The starting guess

Everything starts with a formula, because there is nothing else to go on yet. PocketChomp uses Mifflin-St Jeor: weight, height, age and sex give a resting number, and an activity factor scales it up. The activity factor comes from two questions instead of one, how active you are outside of exercise and how many days a week you train, because a desk worker who lifts four times a week does not fit any single option on the usual list.

I don't pretend the split makes the formula more accurate. Self-reported activity is off by 10 to 20% no matter how you ask it. It's just easier to answer honestly.

Here's how much that one answer matters. For my body in May, the formula says:

| Activity answer | What the formula says I burn |
| :--- | :--- |
| Sedentary | 2,419 kcal a day |
| Active, two workouts a week (what's on my profile) | 3,246 kcal a day |
| What my food and weight actually showed | about 2,480 kcal a day |

Same body, same formula, about 800 kcal apart depending on which box I ticked. One answer was close and one was way off, and there's no way to know which until you've eaten through a few weeks of it. That's the problem the rest of this post is about.

## How it learns

Every Monday, PocketChomp looks back over your recent weeks and does this:

> **What you burned = what you ate on average − (how much your trend weight changed × 7,700) ÷ number of days**

7,700 is roughly the calories in a kilogram of body weight. If you ate 2,100 a day and lost weight, you burned more than 2,100. The weight change tells you how much more.

Here's an example over four weeks:

| Step | Number |
| :--- | :--- |
| Average logged intake on counted days | 2,100 kcal |
| Trend weight change over 28 days | −1.2 kg |
| Energy that came from your body (1.2 × 7,700 ÷ 28) | 330 kcal a day |
| What you burned | about 2,430 kcal a day |

Your eating target is then that number plus your goal. If you're losing half a kilo a week, the goal part takes about 550 off. If you're maintaining, it takes nothing off.

That's the idea. The real thing has more care in it: how much history to look at, how to smooth the scale, how to treat light days, and how fast to move. I tuned those against a lot of testing, and I'm keeping the exact settings to myself. What matters for using it is below.

## Trend weight, not today's weight

The scale on any one morning is mostly noise. Salt, water, a late dinner, a hard workout and where you are in your cycle all move it by more than a day's worth of fat ever could. So the check-in never uses a single weigh-in. It uses a **trend weight**, a running average that each new weigh-in nudges instead of replaces. One odd morning barely registers, and one weigh-in after a long gap can't yank it around.

You don't have to weigh in every day. The check-in does need a recent weigh-in around the end of the week. If your latest one is too old, the check-in asks you to log today's weight and leaves your target where it is until you do.

It also needs enough logged days before it changes anything. If there aren't enough, the check-in says "No change this week" and your target doesn't move. Nothing is wrong. There just isn't enough to go on yet.

## It moves slowly on purpose

Each check-in can only move your estimate so far. If the math says your maintenance is 600 lower than the app thought, it gets there over a few weeks, not in one jump.

Imagine you put in a solid week of logging everything, and the app's response is to tell you to eat 600 fewer calories a day, starting tomorrow. That's unreasonable, and honestly a bit rude. It's the kind of thing that makes people give up. Small steps are easier to live with, and if the gap is real, it keeps showing up week after week and the estimate keeps closing it.

It also means one weird week, a holiday, a cold, a week of eating out, can't throw your target around.

You also don't have to take the update. Every check-in ends with **Apply Update** or **Keep Current Target**, and it's your call.

## What it does with missed days

A day with nothing logged is left out. It isn't treated as a day you ate nothing. If you logged 20 of the last 28 days, the average is worked out from those 20, and the check-in tells you how many days had no logs.

Light days need a bit more care, because a half-logged Tuesday looks a lot like a light Tuesday. If you don't mark a day, a very light one isn't counted. You can also settle a day yourself from the diary:

- **That's everything** counts the day as it is, even if it's light. If it's very light, the app asks once more before counting it.
- **Add an estimate** lets you put in a rough number for a meal you didn't log properly.
- **Leave it out** takes the day out of your averages entirely.

At check-in time, any days from the past week you haven't marked are shown so you can settle them before the numbers run.

## Why it never judges you

The check-in never calls a day good or bad, never says you ate too much, and never guesses that you forgot to log something. That's on purpose. I don't want PocketChomp to contribute to eating disorders or harm anyone. I want it to be reasonable for a lot of different people. It gives you the numbers and leaves the judging out.

## Do you need to log exercise?

No. The check-in only reads food and weight. If you start training more, you'll lose a bit faster on the same food, the weight trend shows it, and the estimate goes up. You don't have to trust a watch's calorie number, and you don't have to decide whether to eat it back.

## How I check it

An estimate of what you burn is really a prediction. If the app says you burn 2,466 and you eat 2,298, it's saying you should lose a certain amount of weight. So the test is simple: take what you logged, take the estimate, work out how much weight you should have lost, and compare it with what the scale did.

Here's that check on my own 98 days:

| Estimate | Weight it predicts I'd lose | What I actually lost | Off by |
| :--- | :--- | :--- | :--- |
| Formula, sedentary | 1.5 kg | 2.33 kg | 0.8 kg |
| Formula, my profile answers | 12.1 kg | 2.33 kg | 9.7 kg |
| Dynamic TDEE | 2.1 kg | 2.33 kg | 0.2 kg |

In calories, that's about 60 a day off for the sedentary guess, about 765 a day for the one matching my profile, and about 15 a day for Dynamic TDEE.

Two honest caveats. This is one person, me. And it's not a fair fight, because Dynamic TDEE learned from some of those same weeks while the formula never gets to learn anything. That's sort of the point, but it means this is a sanity check, not proof. It also counts what I logged, not what I ate, so if I under-log a little the estimate quietly absorbs it. For hitting a goal that's what you want: the target that works with how you actually log.

The proper version of this check is the same math across lots of people, month by month. When there are enough people using PocketChomp to do that, I'll do it and post the results, including the parts that don't look good.

## Where it falls short

It needs weigh-ins. Without a recent one the check-in can't do anything, and that's deliberate, because guessing would be worse.

It's slow to catch a big change. If your life changes a lot, a new job on your feet or an injury, the limit on each check-in means it takes a few weeks to catch up. If you know your situation changed, you can always set your target by hand.

It's only as good as the logging is consistent. It doesn't need perfect logging, but a few weeks of logging one way and then another will move the estimate around until things settle.

And it's an estimate. Bodies aren't calculators. The point isn't to be exact to the calorie, it's to get closer than the formula, week after week, without you having to do the spreadsheet yourself.

## Where it lives

Dynamic TDEE is part of PocketChomp+, and there's a 14-day trial, partly so you can see a couple of check-ins happen before deciding. Logging, scanning, your targets and the full nutrient breakdown are free and stay free. If that sounds useful, [sign up for updates](#signup) and I'll let you know when it's public on Play.
