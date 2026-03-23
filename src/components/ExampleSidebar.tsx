import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BoardOption = { slug: string; label: string };

export type ExampleSidebarProps = {
  boardOptions: BoardOption[];
  selectedSlug: string | null;
  onSelectSlug: (slug: string | null) => void;
  className?: string;
};

export function ExampleSidebar({
  boardOptions,
  selectedSlug,
  onSelectSlug,
  className,
}: ExampleSidebarProps) {
  return (
    <aside className={cn("bg-sidebar text-sidebar-foreground w-64 shrink-0 border-sidebar-border border-r", className)}>
      <div className="p-4">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          筛选
        </p>
        <Accordion type="multiple" defaultValue={["boards"]} className="w-full">
          <AccordionItem value="boards" className="border-sidebar-border border-b-0">
            <AccordionTrigger className="text-sidebar-foreground py-2 hover:no-underline">
              按板子
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex max-h-[min(60vh,28rem)] flex-col gap-1 overflow-y-auto pr-1">
                <Button
                  type="button"
                  variant={selectedSlug === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSelectSlug(null)}
                >
                  全部
                </Button>
                {boardOptions.map((b) => (
                  <Button
                    key={b.slug}
                    type="button"
                    variant={selectedSlug === b.slug ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onSelectSlug(b.slug)}
                  >
                    {b.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
