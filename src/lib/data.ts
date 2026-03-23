import { parse as parseYaml } from "yaml";

export type ExampleStatus = "basics" | "peripheral" | "others";

export type ExampleMeta = {
  boardSlug: string;
  slug: string;
  title: string;
  status: ExampleStatus;
  sys?: string;
  lastUpdate?: string;
  /** Vite glob key */
  mdGlobKey: string;
};

export type BoardMeta = {
  slug: string;
  product: string;
  cpu: string;
  cpuCore?: string;
  ram?: string;
  vendor: string;
  examples: ExampleMeta[];
};

const boardReadmeGlob = import.meta.glob("../../test-doc/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const exampleMdGlob = import.meta.glob("../../test-doc/*/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  try {
    const data = parseYaml(match[1]) as Record<string, unknown>;
    return { data, body: match[2] };
  } catch {
    return { data: {}, body: raw };
  }
}

function firstHeading(body: string): string | undefined {
  const m = body.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim();
}

function normalizeStatus(raw: unknown): ExampleStatus {
  if (raw === "basics" || raw === "peripheral" || raw === "others") return raw;
  return "others";
}

function parseBoardSlugFromReadmeKey(key: string): string | null {
  const norm = key.replace(/\\/g, "/");
  const m = norm.match(/test-doc\/([^/]+)\/README\.md$/);
  return m?.[1] ?? null;
}

function parseExamplePath(key: string): { board: string; example: string } | null {
  const norm = key.replace(/\\/g, "/");
  const m = norm.match(/test-doc\/([^/]+)\/([^/]+)\/([^/]+\.md)$/);
  if (!m) return null;
  return { board: m[1], example: m[2] };
}

function pickExampleMdKey(keys: string[]): string {
  const ex = keys.filter((k) => !k.endsWith("/README.md"));
  const preferred = ex.find((k) => /\/example_[^/]+\.md$/i.test(k.replace(/\\/g, "/")));
  if (preferred) return preferred;
  return ex.sort()[0] ?? keys[0];
}

function buildBoardMeta(slug: string, readmeRaw: string, examples: ExampleMeta[]): BoardMeta {
  const { data, body } = splitFrontmatter(readmeRaw);
  const product =
    (typeof data["product"] === "string" && data["product"]) ||
    firstHeading(body) ||
    slug;
  return {
    slug,
    product,
    cpu: typeof data["cpu"] === "string" ? data["cpu"] : "",
    cpuCore: typeof data["cpu_core"] === "string" ? data["cpu_core"] : undefined,
    ram: typeof data["ram"] === "string" ? data["ram"] : undefined,
    vendor: typeof data["vendor"] === "string" ? data["vendor"] : "",
    examples: examples.sort((a, b) => a.slug.localeCompare(b.slug)),
  };
}

function buildExampleMeta(globKey: string, raw: string, boardSlug: string, exampleSlug: string): ExampleMeta {
  const { data } = splitFrontmatter(raw);
  const title = exampleSlug;
  const sys = typeof data["sys"] === "string" ? data["sys"] : undefined;
  const lastRaw = data["last_update"] ?? data["lastUpdate"];
  const lastUpdate = typeof lastRaw === "string" ? lastRaw : undefined;

  return {
    boardSlug,
    slug: exampleSlug,
    title: String(title),
    status: normalizeStatus(data["status"]),
    sys,
    lastUpdate,
    mdGlobKey: globKey,
  };
}

/** Chip node: groups boards sharing the same CPU under one vendor. */
export type ChipGroup = {
  cpu: string;
  boards: BoardMeta[];
};

/** Vendor node: top-level grouping. */
export type VendorGroup = {
  vendor: string;
  chips: ChipGroup[];
};

/** Build the vendor → chip → board tree from a flat board list. */
export function groupBoardsByVendorChip(boards: BoardMeta[]): VendorGroup[] {
  const vendorMap = new Map<string, Map<string, BoardMeta[]>>();
  for (const b of boards) {
    const v = b.vendor || "Other";
    const c = b.cpu || "Unknown";
    if (!vendorMap.has(v)) vendorMap.set(v, new Map());
    const chipMap = vendorMap.get(v)!;
    if (!chipMap.has(c)) chipMap.set(c, []);
    chipMap.get(c)!.push(b);
  }
  return Array.from(vendorMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([vendor, chipMap]) => ({
      vendor,
      chips: Array.from(chipMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cpu, boards]) => ({
          cpu,
          boards: boards.sort((a, b) => a.product.localeCompare(b.product)),
        })),
    }));
}

let cacheBoards: BoardMeta[] | null = null;

export function getAllBoards(): BoardMeta[] {
  if (cacheBoards) return cacheBoards;

  const byBoard = new Map<string, Map<string, string[]>>();

  for (const key of Object.keys(exampleMdGlob)) {
    const parsed = parseExamplePath(key);
    if (!parsed) continue;
    const { board, example } = parsed;
    if (!byBoard.has(board)) byBoard.set(board, new Map());
    const exMap = byBoard.get(board)!;
    if (!exMap.has(example)) exMap.set(example, []);
    exMap.get(example)!.push(key);
  }

  const boards: BoardMeta[] = [];

  for (const readmeKey of Object.keys(boardReadmeGlob)) {
    const slug = parseBoardSlugFromReadmeKey(readmeKey);
    if (!slug) continue;
    const readmeRaw = boardReadmeGlob[readmeKey];
    const exMap = byBoard.get(slug) ?? new Map();
    const examples: ExampleMeta[] = [];
    for (const [exampleSlug, keys] of exMap) {
      const pick = pickExampleMdKey(keys);
      const raw = exampleMdGlob[pick];
      if (!raw) continue;
      examples.push(buildExampleMeta(pick, raw, slug, exampleSlug));
    }
    boards.push(buildBoardMeta(slug, readmeRaw, examples));
  }

  for (const slug of byBoard.keys()) {
    if (!boards.some((b) => b.slug === slug)) {
      const exMap = byBoard.get(slug)!;
      const examples: ExampleMeta[] = [];
      for (const [exampleSlug, keys] of exMap) {
        const pick = pickExampleMdKey(keys);
        const raw = exampleMdGlob[pick];
        if (!raw) continue;
        examples.push(buildExampleMeta(pick, raw, slug, exampleSlug));
      }
      const placeholder = `# ${slug}\n`;
      boards.push(buildBoardMeta(slug, placeholder, examples));
    }
  }

  cacheBoards = boards.sort((a, b) => a.slug.localeCompare(b.slug));
  return cacheBoards;
}

export function getBoardBySlug(slug: string): BoardMeta | undefined {
  return getAllBoards().find((b) => b.slug === slug);
}

export function getExampleMeta(
  boardSlug: string,
  exampleSlug: string,
): ExampleMeta | undefined {
  const b = getBoardBySlug(boardSlug);
  return b?.examples.find((e) => e.slug === exampleSlug);
}

/** Example doc: `./images/x` → `/test-doc/{board}/{example}/images/x` */
export function rewriteExampleMediaPaths(
  markdown: string,
  boardSlug: string,
  exampleSlug: string,
): string {
  return markdown.replace(/\]\(\.\/([^)]+)\)/g, `](/test-doc/${boardSlug}/${exampleSlug}/$1)`);
}

/** Board README: `./images/x` → `/test-doc/{board}/images/x` */
export function rewriteBoardReadmeMediaPaths(markdown: string, boardSlug: string): string {
  return markdown.replace(/\]\(\.\/([^)]+)\)/g, `](/test-doc/${boardSlug}/$1)`);
}

function getRawByGlobKey(key: string): string | undefined {
  return exampleMdGlob[key];
}

/** Markdown body (no frontmatter), with media paths fixed for /test-doc */
export function getExampleMarkdownBody(boardSlug: string, exampleSlug: string): string | undefined {
  const ex = getExampleMeta(boardSlug, exampleSlug);
  if (!ex) return undefined;
  const raw = getRawByGlobKey(ex.mdGlobKey);
  if (!raw) return undefined;
  const body = splitFrontmatter(raw).body.trim();
  return rewriteExampleMediaPaths(body, boardSlug, exampleSlug);
}

const readmeZhGlob = import.meta.glob("../../test-doc/*/README_zh.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function boardReadmeKey(slug: string, kind: "en" | "zh"): string | undefined {
  const name = kind === "zh" ? "README_zh.md" : "README.md";
  const suffix = `test-doc/${slug}/${name}`;
  return Object.keys(kind === "zh" ? readmeZhGlob : boardReadmeGlob).find((k) =>
    k.replace(/\\/g, "/").includes(suffix),
  );
}

/** Strip the first `# …` heading if it matches the board product name (avoids duplication with page header). */
export function stripDuplicateHeading(body: string, product: string): string {
  const m = body.match(/^(#\s+(.+))(\r?\n)/);
  if (!m) return body;
  const heading = m[2].trim();
  if (heading === product || heading === product.trim()) {
    return body.slice(m[0].length).trimStart();
  }
  return body;
}

/** Board intro markdown body (no frontmatter), zh preferred */
export function getBoardReadmeBody(slug: string, lang: "zh" | "en"): string | undefined {
  const zhKey = boardReadmeKey(slug, "zh");
  const enKey = boardReadmeKey(slug, "en");
  const raw =
    lang === "zh" && zhKey && readmeZhGlob[zhKey]
      ? readmeZhGlob[zhKey]
      : enKey && boardReadmeGlob[enKey]
        ? boardReadmeGlob[enKey]
        : zhKey && readmeZhGlob[zhKey]
          ? readmeZhGlob[zhKey]
          : undefined;
  if (!raw) return undefined;
  const body = splitFrontmatter(raw).body.trim();
  return rewriteBoardReadmeMediaPaths(body, slug);
}
