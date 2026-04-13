import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoardMeta, SiliconVendorGroup } from "@/lib/data";
import { boardMatchesQuery, groupBoardsBySiliconVendorChip, slugifyUrlSegment } from "@/lib/data";

export type SiteSidebarProps = {
  boards: BoardMeta[];
  className?: string;
};

export function SiteSidebar({ boards, className }: SiteSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState("");
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(() =>
    new Set(boards.map((b) => b.socVendor ?? "Unknown")),
  );
  const [expandedChips, setExpandedChips] = useState<Set<string>>(() =>
    new Set(boards.map((b) => `${b.socVendor ?? "Unknown"}::${b.cpu || "Unknown"}`)),
  );

  const tree: SiliconVendorGroup[] = useMemo(() => {
    const all = groupBoardsBySiliconVendorChip(boards);
    if (!filter.trim()) return all;
    return all
      .map((vg) => ({
        ...vg,
        chips: vg.chips
          .map((cg) => ({
            ...cg,
            boards: cg.boards.filter((b) => boardMatchesQuery(b, filter)),
          }))
          .filter((cg) => cg.boards.length > 0),
      }))
      .filter((vg) => vg.chips.length > 0);
  }, [boards, filter]);

  function toggleVendor(siliconVendor: string) {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(siliconVendor)) next.delete(siliconVendor);
      else next.add(siliconVendor);
      return next;
    });
  }

  function toggleChip(key: string) {
    setExpandedChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "border-border bg-background sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r lg:flex",
        collapsed ? "w-14" : "w-72",
        className,
      )}
    >
      <div className={cn("flex h-full w-full flex-col", collapsed && "items-center")}>
        <div
          className={cn(
            "border-border flex w-full flex-col gap-2 border-b p-3",
            collapsed && "items-center p-2",
          )}
        >
          <div className={cn("flex w-full items-center gap-2", collapsed && "flex-col")}>
            <a
              href="/"
              className={cn(
                "hover:bg-muted/60 flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1 transition-colors",
                collapsed && "w-full justify-center px-1",
              )}
              aria-label="回到首页"
              title="回到首页"
            >
              <img
                src="/ruyi-logo-256.png"
                alt="RuyiSDK"
                className={cn("h-6 w-6 shrink-0", collapsed && "h-7 w-7")}
              />
              {!collapsed && <span className="text-foreground truncate text-sm font-semibold">RuyiSDK Examples</span>}
            </a>

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                "text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm transition-colors",
                collapsed && "h-9 w-9",
              )}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
              title={collapsed ? "展开侧栏" : "收起侧栏"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>

          {!collapsed && (
            <Input
              type="search"
              placeholder="搜索开发板、厂商、SoC、核心等…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 text-sm"
              aria-label="搜索"
            />
          )}
        </div>

        {!collapsed && (
          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {tree.length === 0 && (
              <p className="text-muted-foreground px-3 py-4 text-center text-xs">无匹配</p>
            )}

            {tree.map((vg) => {
              const vendorOpen = expandedVendors.has(vg.siliconVendor);
              const vendorSlug = slugifyUrlSegment(vg.siliconVendor);
              const vendorHref = `/vendors/${encodeURIComponent(vendorSlug)}/`;
              return (
                <div key={vg.siliconVendor} className="mb-1">
                  <div className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-2 py-1.5">
                    <a
                      href={vendorHref}
                      className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      {vg.siliconVendor}
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleVendor(vg.siliconVendor)}
                      className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5"
                      aria-label={vendorOpen ? "折叠" : "展开"}
                    >
                      <ChevronIcon open={vendorOpen} />
                    </button>
                  </div>

                  {vendorOpen && (
                    <div className="ml-3">
                      {vg.chips.map((cg) => {
                        const chipKey = `${vg.siliconVendor}::${cg.cpu}`;
                        const chipOpen = expandedChips.has(chipKey);
                        // 需求：点击 SoC 也显示芯片厂商页（这里跳到厂商页并定位到该 SoC 段落）
                        const socAnchor = `soc-${slugifyUrlSegment(cg.cpu)}`;
                        const socHref = `${vendorHref}#${encodeURIComponent(socAnchor)}`;
                        return (
                          <div key={chipKey}>
                            <div className="hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-2 py-1">
                              <a
                                href={socHref}
                                className="text-muted-foreground min-w-0 flex-1 truncate text-sm underline-offset-4 hover:underline"
                              >
                                {cg.cpu}
                              </a>
                              <button
                                type="button"
                                onClick={() => toggleChip(chipKey)}
                                className="text-muted-foreground hover:text-foreground shrink-0 rounded p-0.5"
                                aria-label={chipOpen ? "折叠" : "展开"}
                              >
                                <ChevronIcon open={chipOpen} />
                              </button>
                            </div>

                            {chipOpen && (
                              <div className="ml-3">
                                {cg.boards.map((b) => (
                                  <a
                                    key={b.slug}
                                    href={`/boards/${encodeURIComponent(b.slug)}/`}
                                    className="text-foreground hover:bg-muted/60 flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors"
                                  >
                                    <span className="truncate">{b.product}</span>
                                    <span className="text-muted-foreground ml-2 shrink-0 text-xs tabular-nums">
                                      {b.examples.length}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className={cn("text-muted-foreground shrink-0 transition-transform duration-150", open && "rotate-90")}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

