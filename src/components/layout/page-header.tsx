import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  backLink?: string;
}

export function PageHeader({
  title,
  subtitle,
  description,
  actions,
  children,
  backLink,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {backLink && (
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <Link href={backLink} aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {(subtitle || description) && (
            <p className="text-sm text-muted-foreground">{subtitle || description}</p>
          )}
        </div>
      </div>
      {(actions || children) && <div className="flex items-center gap-2">{actions}{children}</div>}
    </div>
  );
}
