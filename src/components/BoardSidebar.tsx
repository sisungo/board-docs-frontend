import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoardMeta, VendorGroup } from "@/lib/data";
import { groupBoardsByVendorChip } from "@/lib/data";

export type BoardSidebarProps = {
  boards: BoardMeta[];
  className?: string;
};

export function BoardSidebar({ boards, className }: BoardSidebarProps) {
  const [filter, setFilter] = useState("");
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(() =>
    new Set(boards.map((b) => b.vendor || "Other")),
  );
  const [expandedChips, setExpandedChips] = useState<Set<string>>(() =>
    new Set(boards.map((b) => `${b.vendor || "Other"}::${b.cpu || "Unknown"}`)),
  );

  const tree: VendorGroup[] = useMemo(() => {
    const all = groupBoardsByVendorChip(boards);
    if (!filter.trim()) return all;
    const q = filter.trim().toLowerCase();
    return all
      .map((vg) => ({
        ...vg,
        chips: vg.chips
          .map((cg) => ({
            ...cg,
            boards: cg.boards.filter(
              (b) =>
                b.product.toLowerCase().includes(q) ||
                b.cpu.toLowerCase().includes(q) ||
                b.vendor.toLowerCase().includes(q) ||
                b.slug.toLowerCase().includes(q),
            ),
          }))
          .filter((cg) => cg.boards.length > 0),
      }))
      .filter((vg) => vg.chips.length > 0);
  }, [boards, filter]);

  function toggleVendor(vendor: string) {
    setExpandedVendors((prev) => {
      const next = new Set(prev);
      if (next.has(vendor)) next.delete(vendor);
      else next.add(vendor);
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
        "border-border sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r",
        className,
      )}
    >
      <div className="p-4">
        <Input
          type="search"
          placeholder="Search boards…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-8 text-sm"
          aria-label="Filter boards"
        />
      </div>

      <nav className="px-2 pb-6">
        {tree.length === 0 && (
          <p className="text-muted-foreground px-3 py-4 text-center text-xs">无匹配</p>
        )}

        {tree.map((vg) => {
          const vendorOpen = expandedVendors.has(vg.vendor);
          return (
            <div key={vg.vendor} className="mb-1">
              {/* Vendor header */}
              <button
                type="button"
                onClick={() => toggleVendor(vg.vendor)}
                className="hover:bg-muted/60 flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition-colors"
              >
                <span className="text-foreground text-sm font-semibold">{vg.vendor}</span>
                <ChevronIcon open={vendorOpen} />
              </button>

              {vendorOpen && (
                <div className="ml-2">
                  {vg.chips.map((cg) => {
                    const chipKey = `${vg.vendor}::${cg.cpu}`;
                    const chipOpen = expandedChips.has(chipKey);
                    return (
                      <div key={chipKey}>
                        {/* Chip header */}
                        <button
                          type="button"
                          onClick={() => toggleChip(chipKey)}
                          className="hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-3 py-1 text-left transition-colors"
                        >
                          <span className="text-muted-foreground text-sm">{cg.cpu}</span>
                          <ChevronIcon open={chipOpen} />
                        </button>

                        {chipOpen && (
                          <div className="ml-2">
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
    </aside>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn(
        "text-muted-foreground shrink-0 transition-transform duration-150",
        open && "rotate-90",
      )}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
