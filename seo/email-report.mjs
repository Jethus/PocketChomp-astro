/**
 * Emails the SEO report that seo/measure.mjs wrote. The daily job sends it on
 * Mondays instead of printing it: this repo is public, and so is everything
 * an Actions run writes.
 *
 *   node seo/email-report.mjs [path/to/report.md]
 * Needs FASTMAIL_SMTP_USER (the Fastmail login) and FASTMAIL_SMTP_PASSWORD
 * (an app password limited to SMTP), from the environment or .env.
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";
import { REPORT_TO } from "./config.mjs";
import { env } from "./measure.mjs";

const path = process.argv[2] ?? ".seo-state/report.md";
const user = env("FASTMAIL_SMTP_USER");
const pass = env("FASTMAIL_SMTP_PASSWORD");
if (!user || !pass) {
  console.error("FASTMAIL_SMTP_USER and FASTMAIL_SMTP_PASSWORD are not set (seo/README.md, Setup).");
  process.exit(1);
}

const text = readFileSync(path, "utf8");
const subject = text.split("\n", 1)[0].replace(/^#\s*/, "");
const transport = nodemailer.createTransport({ host: "smtp.fastmail.com", port: 465, secure: true, auth: { user, pass } });
await transport.sendMail({ from: `PocketChomp SEO <${REPORT_TO}>`, to: REPORT_TO, subject, text });
console.log(`Sent "${subject}".`);
