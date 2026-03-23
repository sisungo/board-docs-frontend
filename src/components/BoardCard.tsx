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

export type BoardCardProps = {
  product: string;
  slug: string;
  cpu: string;
  vendor: string;
  exampleCount: number;
  className?: string;
};

export function BoardCard({ product, slug, cpu, vendor, exampleCount, className }: BoardCardProps) {
  const href = `/boards/${encodeURIComponent(slug)}/`;

  return (
    <a
      href={href}
      className={cn(
        "block min-w-0 rounded-xl outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg">{product}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {exampleCount} 个示例
            </Badge>
          </div>
          <CardDescription className="line-clamp-2 font-mono text-xs">{slug}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">CPU：</span>
            {cpu || "—"}
            {vendor ? (
              <>
                {" "}
                <span className="font-medium text-foreground">厂商：</span>
                {vendor}
              </>
            ) : null}
          </p>
        </CardContent>
        <CardFooter className="text-muted-foreground justify-end text-xs">查看板子与示例</CardFooter>
      </Card>
    </a>
  );
}
