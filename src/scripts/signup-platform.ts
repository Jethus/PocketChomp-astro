/**
 * Fills the hidden `fields[platform]` input on every signup form with the
 * visitor's phone platform, so Kit records which subscribers are on iPhone
 * and the iOS launch email can go to just them. One button for everyone; the
 * visitor never picks anything.
 *
 * "desktop" means the signup came from a computer, so their phone is unknown.
 * iPadOS Safari reports itself as a Mac, so a Mac with a touch screen counts
 * as iOS. Without JavaScript the field stays empty and the signup still works.
 */
function detectPlatform(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const platform = detectPlatform();

document
  .querySelectorAll<HTMLInputElement>("form[data-signup-form] input[data-platform-field]")
  .forEach((input) => {
    input.value = platform;
  });

export {};
