import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ExampleCardProps = {
  title: string;
  slug: string;
  categoryLabel: string;
  boards: string[];
  className?: string;
};

export function ExampleCard({ title, slug, categoryLabel, boards, className }: ExampleCardProps) {
  const href = `/examples/${encodeURIComponent(slug)}/`;

  return (
    <a href={href} className={cn("block min-w-0 rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring", className)}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {categoryLabel}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 font-mono text-xs">{slug}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm">
            {boards.length ? (
              <>
                <span className="font-medium text-foreground">支持的板子：</span>
                {boards.join(" · ")}
              </>
            ) : (
              <span className="italic">未标注板子</span>
            )}
          </p>
        </CardContent>
        <CardFooter className="text-muted-foreground justify-end text-xs">查看详情</CardFooter>
      </Card>
    </a>
  );
}
