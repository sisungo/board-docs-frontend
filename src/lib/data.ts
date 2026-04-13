import { parse as parseYaml } from "yaml";

export type ExampleStatus = "basics" | "peripheral" | "benchmark" | "application";

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
  /** Board vendor (板厂)，如 Sipeed、Milk-V */
  vendor: string;
  /** Silicon / chip IP vendor（芯片厂商），侧栏第一层分组用 */
  socVendor?: string;
  examples: ExampleMeta[];
};

/** URL segment: lowercase, spaces → hyphens, strip unsafe chars */
export function slugifyUrlSegment(s: string): string {
  const t = s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return t || "unknown";
}

export function siliconVendorSlug(b: BoardMeta): string {
  return slugifyUrlSegment(b.socVendor ?? "Unknown");
}

export function socSlugFromCpu(cpu: string): string {
  return slugifyUrlSegment(cpu || "Unknown");
}

// Content repo layout compatibility:
// - legacy: test-doc/{Board}/README.md, test-doc/{Board}/{Example}/*.md
// - new:    test-doc/boards/{Board}/README.md, test-doc/boards/{Board}/{Example}/*.md
//
// We keep the local folder name `test-doc/` stable and just adapt globs.
const boardReadmeGlobLegacy = import.meta.glob("../../test-doc/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const boardReadmeGlobBoards = import.meta.glob("../../test-doc/boards/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const boardReadmeGlob: Record<string, string> = {
  ...boardReadmeGlobLegacy,
  ...boardReadmeGlobBoards,
};

const exampleMdGlobLegacy = import.meta.glob("../../test-doc/*/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const exampleMdGlobBoards = import.meta.glob("../../test-doc/boards/*/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const exampleMdGlob: Record<string, string> = {
  ...exampleMdGlobLegacy,
  ...exampleMdGlobBoards,
};

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
  if (raw === "basics" || raw === "peripheral" || raw === "benchmark" || raw === "application") {
    return raw;
  }
  /** @deprecated 旧稿用 others，现并入性能评测 */
  if (raw === "others") return "benchmark";
  return "application";
}

function parseBoardSlugFromReadmeKey(key: string): string | null {
  const norm = key.replace(/\\/g, "/");
  // Support both:
  // - test-doc/{board}/README.md
  // - test-doc/boards/{board}/README.md
  const m = norm.match(/test-doc\/(?:boards\/)?([^/]+)\/README\.md$/);
  const slug = m?.[1] ?? null;
  if (!slug) return null;
  // Never treat templates as a board.
  if (slug.toLowerCase() === "templates") return null;
  return slug;
}

function parseExamplePath(key: string): { board: string; example: string } | null {
  const norm = key.replace(/\\/g, "/");
  // Support both:
  // - test-doc/{board}/{example}/{file}.md
  // - test-doc/boards/{board}/{example}/{file}.md
  const m = norm.match(/test-doc\/(?:boards\/)?([^/]+)\/([^/]+)\/([^/]+\.md)$/);
  if (!m) return null;
  const board = m[1];
  const example = m[2];
  if (board.toLowerCase() === "templates") return null;
  if (example.toLowerCase() === "templates") return null;
  return { board, example };
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
  const siliconVendorRaw = data["silicon_vendor"] ?? data["soc_vendor"];
  return {
    slug,
    product,
    cpu: typeof data["cpu"] === "string" ? data["cpu"] : "",
    cpuCore: typeof data["cpu_core"] === "string" ? data["cpu_core"] : undefined,
    ram: typeof data["ram"] === "string" ? data["ram"] : undefined,
    vendor: typeof data["vendor"] === "string" ? data["vendor"] : "",
    socVendor:
      typeof siliconVendorRaw === "string" && siliconVendorRaw.trim()
        ? String(siliconVendorRaw).trim()
        : undefined,
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

/** @deprecated Use SiliconVendorGroup + groupBoardsBySiliconVendorChip */
export type VendorGroup = SiliconVendorGroup;

/** Top-level = 芯片厂商 (silicon_vendor, backward-compatible: soc_vendor) */
export type SiliconVendorGroup = {
  siliconVendor: string;
  chips: ChipGroup[];
};

/** Build 芯片厂商 → SoC(cpu) → board tree */
export function groupBoardsBySiliconVendorChip(boards: BoardMeta[]): SiliconVendorGroup[] {
  const vendorMap = new Map<string, Map<string, BoardMeta[]>>();
  for (const b of boards) {
    const v = b.socVendor ?? "Unknown";
    const c = b.cpu || "Unknown";
    if (!vendorMap.has(v)) vendorMap.set(v, new Map());
    const chipMap = vendorMap.get(v)!;
    if (!chipMap.has(c)) chipMap.set(c, []);
    chipMap.get(c)!.push(b);
  }
  return Array.from(vendorMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([siliconVendor, chipMap]) => ({
      siliconVendor,
      chips: Array.from(chipMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cpu, bs]) => ({
          cpu,
          boards: bs.sort((a, b) => a.product.localeCompare(b.product)),
        })),
    }));
}

/** Backward-compatible alias */
export function groupBoardsByVendorChip(boards: BoardMeta[]): SiliconVendorGroup[] {
  return groupBoardsBySiliconVendorChip(boards);
}

/** Home + sidebar search: product, slug, cpu, 板厂, 芯片厂商, cpu_core, ram */
export function boardMatchesQuery(b: BoardMeta, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const parts = [
    b.product,
    b.slug,
    b.cpu,
    b.vendor,
    b.socVendor ?? "",
    b.cpuCore ?? "",
    b.ram ?? "",
  ];
  return parts.some((p) => p.toLowerCase().includes(s));
}

export function getBoardsForSiliconVendorUrlSlug(urlSlug: string): BoardMeta[] {
  return getAllBoards().filter((b) => siliconVendorSlug(b) === urlSlug);
}

export function getBoardsForSocUrlSlug(urlSlug: string): BoardMeta[] {
  return getAllBoards().filter((b) => socSlugFromCpu(b.cpu) === urlSlug);
}

export function getUniqueSiliconVendorUrlSlugs(): { slug: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const b of getAllBoards()) {
    const label = b.socVendor ?? "Unknown";
    const slug = siliconVendorSlug(b);
    if (!seen.has(slug)) seen.set(slug, label);
  }
  return Array.from(seen.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getUniqueSocUrlSlugs(): { slug: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const b of getAllBoards()) {
    const label = b.cpu || "Unknown";
    const slug = socSlugFromCpu(b.cpu);
    if (!seen.has(slug)) seen.set(slug, label);
  }
  return Array.from(seen.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
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

const readmeZhGlobLegacy = import.meta.glob("../../test-doc/*/README_zh.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const readmeZhGlobBoards = import.meta.glob("../../test-doc/boards/*/README_zh.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const readmeZhGlob: Record<string, string> = {
  ...readmeZhGlobLegacy,
  ...readmeZhGlobBoards,
};

function boardReadmeKey(slug: string, kind: "en" | "zh"): string | undefined {
  const name = kind === "zh" ? "README_zh.md" : "README.md";
  const suffix = `test-doc/${slug}/${name}`;
  return Object.keys(kind === "zh" ? readmeZhGlob : boardReadmeGlob).find((k) =>
    k.replace(/\\/g, "/").includes(suffix),
  );
}

/** Strip the first `# …` heading if it matches the board product name (avoids duplication with page header). */
export function stripDuplicateHeading(body: string, product: string): string {
  // Support both "\n" and EOF right after the first heading line.
  // Some README_zh.md files are a single H1 line with no trailing newline.
  const m = body.match(/^(#\s+(.+))(\r?\n|$)/);
  if (!m) return body;
  const normalize = (s: string) =>
    s
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const stripTrailingParens = (s: string) =>
    s
      // English parentheses suffix: "Foo (64M)"
      .replace(/\s*\([^)]*\)\s*$/g, "")
      // Chinese parentheses suffix: "Foo（64M）"
      .replace(/\s*（[^）]*）\s*$/g, "")
      .trim();
  const heading = normalize(m[2]);
  const prod = normalize(product);
  const headingNoParens = normalize(stripTrailingParens(m[2]));
  const prodNoParens = normalize(stripTrailingParens(product));
  if (heading === prod || headingNoParens === prod || heading === prodNoParens || headingNoParens === prodNoParens) {
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
