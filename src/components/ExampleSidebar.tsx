import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ExampleSidebarProps = {
  boards: string[];
  selectedBoard: string | null;
  onSelectBoard: (board: string | null) => void;
  className?: string;
};

export function ExampleSidebar({
  boards,
  selectedBoard,
  onSelectBoard,
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
                  variant={selectedBoard === null ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onSelectBoard(null)}
                >
                  全部
                </Button>
                {boards.map((b) => (
                  <Button
                    key={b}
                    type="button"
                    variant={selectedBoard === b ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onSelectBoard(b)}
                  >
                    {b}
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
