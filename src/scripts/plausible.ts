/**
 * Plausible init queue, verbatim from Plausible's own snippet.
 *
 * It lives in a file rather than an inline <script> block for one reason: the
 * site ships a strict CSP with no 'unsafe-inline' for scripts, and Astro only
 * emits a hash for scripts it processes. An inline block is left untouched,
 * unhashed, and silently blocked in production — which is exactly how the blog
 * tag filter broke. Behaviour is identical; only the delivery changes.
 *
 * The stub queues calls made before the async script lands, so custom events
 * fired early (e.g. a signup) are not lost.
 */
declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

type PlausibleFn = ((...args: unknown[]) => void) & {
  q?: unknown[];
  o?: unknown;
  init?: (options?: unknown) => void;
};

const existing = window.plausible;

const queue: PlausibleFn =
  existing ||
  function (...args: unknown[]) {
    (queue.q = queue.q || []).push(args);
  };

queue.init =
  queue.init ||
  function (options?: unknown) {
    queue.o = options || {};
  };

window.plausible = queue;
queue.init();

export {};
