/**
 * Reads one built HTML file into the facts the audit rules check: title,
 * description, canonical, robots, headings, links, images, JSON-LD and the
 * visible text of <main>. No rule logic lives here.
 */
import { parse } from "parse5";
import { createHash } from "node:crypto";

const SKIP_TEXT = new Set(["script", "style", "noscript", "template", "svg"]);

const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;

function walk(node, visit) {
  visit(node);
  for (const child of node.childNodes ?? []) walk(child, visit);
  if (node.content) walk(node.content, visit);
}

function textOf(node) {
  let out = "";
  (function collect(n) {
    if (n.nodeName === "#text") out += n.value;
    else if (!SKIP_TEXT.has(n.nodeName)) for (const c of n.childNodes ?? []) collect(c);
  })(node);
  return out.replace(/\s+/g, " ").trim();
}

/** dist/tools/x/index.html → /tools/x ; dist/index.html → / ; dist/404.html → /404 */
export function pathFromFile(relative) {
  const p = "/" + relative.replace(/\\/g, "/").replace(/(^|\/)index\.html$/, "").replace(/\.html$/, "");
  return p === "/" ? "/" : p.replace(/\/$/, "");
}

export function parsePage(html, path) {
  const doc = parse(html);
  const page = {
    path,
    lang: null,
    title: null,
    description: null,
    canonical: null,
    robots: "",
    h1: [],
    links: [],
    images: [],
    ids: new Set(),
    jsonld: [],
    jsonldErrors: [],
    text: "",
  };
  let main = null;
  let body = null;

  walk(doc, (node) => {
    const id = attr(node, "id");
    if (id) page.ids.add(id);
    switch (node.nodeName) {
      case "html":
        page.lang = attr(node, "lang") ?? null;
        break;
      case "body":
        body = node;
        break;
      case "main":
        main ??= node;
        break;
      case "title":
        page.title ??= textOf(node);
        break;
      case "meta": {
        const name = attr(node, "name")?.toLowerCase();
        if (name === "description") page.description = attr(node, "content") ?? "";
        if (name === "robots" || name === "googlebot") page.robots += ` ${attr(node, "content") ?? ""}`.toLowerCase();
        break;
      }
      case "link":
        if (attr(node, "rel") === "canonical") page.canonical = attr(node, "href") ?? null;
        break;
      case "h1":
        page.h1.push(textOf(node));
        break;
      case "a": {
        const href = attr(node, "href");
        if (href) page.links.push({ href, rel: (attr(node, "rel") ?? "").toLowerCase(), text: textOf(node) });
        break;
      }
      case "img":
        page.images.push({ src: attr(node, "src") ?? "", alt: attr(node, "alt") ?? null });
        break;
      case "script":
        if (attr(node, "type") === "application/ld+json") {
          const raw = node.childNodes?.map((c) => c.value ?? "").join("") ?? "";
          try {
            page.jsonld.push(JSON.parse(raw));
          } catch (error) {
            page.jsonldErrors.push(error.message);
          }
        }
        break;
    }
  });

  page.text = textOf(main ?? body ?? doc);
  page.noindex = /\bnoindex\b/.test(page.robots);
  return page;
}

/** Every node of every JSON-LD block, @graph and nested objects included. */
export function jsonldNodes(page) {
  const out = [];
  (function visit(value) {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      if (value["@type"]) out.push(value);
      Object.values(value).forEach(visit);
    }
  })(page.jsonld);
  return out;
}

/**
 * What a search engine would call "this page's content": if the hash moves,
 * the page changed for readers, and the URL is worth resubmitting.
 */
export function contentHash(page) {
  const parts = [page.title, page.description, page.text, JSON.stringify(page.jsonld)];
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 16);
}
