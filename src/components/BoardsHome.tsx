import { useMemo, useState } from "react";

import { BoardCard } from "@/components/BoardCard";
import { ExampleSidebar } from "@/components/ExampleSidebar";
import { Input } from "@/components/ui/input";
import type { BoardMeta } from "@/lib/data";

export type BoardsHomeProps = {
  boards: BoardMeta[];
};

function matchesSearch(b: BoardMeta, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  if (b.product.toLowerCase().includes(s)) return true;
  if (b.slug.toLowerCase().includes(s)) return true;
  if (b.cpu.toLowerCase().includes(s)) return true;
  if (b.vendor.toLowerCase().includes(s)) return true;
  return false;
}

export default function BoardsHome({ boards }: BoardsHomeProps) {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const boardOptions = useMemo(
    () => boards.map((b) => ({ slug: b.slug, label: b.product })),
    [boards],
  );

  const filtered = useMemo(() => {
    return boards.filter((b) => {
      if (selectedSlug !== null && b.slug !== selectedSlug) return false;
      return matchesSearch(b, query);
    });
  }, [boards, query, selectedSlug]);

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="bg-card/80 border-border sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
              RuyiSDK Examples
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm">
              在 RISC-V 开发板上运行你的第一个程序
            </p>
          </div>
          <div className="w-full sm:max-w-sm">
            <Input
              type="search"
              placeholder="搜索板子名、slug、CPU 或厂商"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索开发板"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <ExampleSidebar
          boardOptions={boardOptions}
          selectedSlug={selectedSlug}
          onSelectSlug={setSelectedSlug}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <p className="text-muted-foreground mb-4 text-sm">
            共 {filtered.length} 块开发板
            {selectedSlug
              ? `（已选：${boardOptions.find((o) => o.slug === selectedSlug)?.label ?? selectedSlug}）`
              : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
              没有匹配的板子，请调整搜索或筛选。
            </div>
          ) : (
            <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((b) => (
                <li key={b.slug}>
                  <BoardCard
                    product={b.product}
                    slug={b.slug}
                    cpu={b.cpu}
                    vendor={b.vendor}
                    exampleCount={b.examples.length}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
