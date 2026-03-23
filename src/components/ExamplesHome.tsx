import { useMemo, useState } from "react";

import { ExampleCard } from "@/components/ExampleCard";
import { ExampleSidebar } from "@/components/ExampleSidebar";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABEL_ZH } from "@/lib/category-labels";
import type { ExampleMeta } from "@/lib/examples";

export type ExamplesHomeProps = {
  examples: ExampleMeta[];
  boards: string[];
};

function matchesSearch(ex: ExampleMeta, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  if (ex.title.toLowerCase().includes(s)) return true;
  if (ex.slug.toLowerCase().includes(s)) return true;
  return ex.boards.some((b) => b.toLowerCase().includes(s));
}

function matchesBoard(ex: ExampleMeta, board: string | null): boolean {
  if (board === null) return true;
  return ex.boards.includes(board);
}

export default function ExamplesHome({ examples, boards }: ExamplesHomeProps) {
  const [query, setQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return examples.filter((ex) => matchesSearch(ex, query) && matchesBoard(ex, selectedBoard));
  }, [examples, query, selectedBoard]);

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
              placeholder="搜索示例标题、slug 或板子名"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="搜索示例"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <ExampleSidebar
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <p className="text-muted-foreground mb-4 text-sm">
            共 {filtered.length} 个示例
            {selectedBoard ? `（已选板子：${selectedBoard}）` : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="text-muted-foreground rounded-xl border border-dashed p-12 text-center text-sm">
              没有匹配的示例，请调整搜索或板子筛选。
            </div>
          ) : (
            <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((ex) => (
                <li key={ex.slug}>
                  <ExampleCard
                    title={ex.title}
                    slug={ex.slug}
                    categoryLabel={CATEGORY_LABEL_ZH[ex.category]}
                    boards={ex.boards}
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
