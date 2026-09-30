import { useMemo } from "react";
import { GraduationCap, Check, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useActiveClass } from "@/hooks/use-active-class";
import { getCatalog } from "@/lib/content.functions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ClassSwitcherProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  showLabel?: boolean;
}

export function ClassSwitcher({ className, size = "sm", showLabel = true }: ClassSwitcherProps) {
  const { activeClass, switchClass, allClasses, classLabel } = useActiveClass();

  const { data: catalogSubjects } = useQuery({
    queryKey: ["catalog"],
    queryFn: () => getCatalog(),
    staleTime: 60_000,
  });

  const subjectCountByClass = useMemo(() => {
    const map: Record<number, number> = {};
    (catalogSubjects ?? []).forEach((s) => {
      if (s.class_level) {
        map[s.class_level] = (map[s.class_level] || 0) + 1;
      }
    });
    return map;
  }, [catalogSubjects]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "h-7.5 sm:h-8.5 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border-primary/30 bg-primary/5 px-2 sm:px-3 text-[11px] sm:text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary shadow-xs shrink-0 cursor-pointer",
            className,
          )}
        >
          <GraduationCap className="size-3.5 text-primary shrink-0" />
          <span className="truncate">{classLabel(activeClass)}</span>
          <ChevronDown className="size-3 opacity-70 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border-border/80">
        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Select Your Class
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allClasses.map((classNum) => {
          const isSelected = activeClass === classNum;
          const count = subjectCountByClass[classNum] || 0;
          return (
            <DropdownMenuItem
              key={classNum}
              onClick={() => switchClass(classNum)}
              className={cn(
                "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors",
                isSelected && "bg-primary/10 font-bold text-primary",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(isSelected ? "text-primary font-bold" : "text-foreground")}>
                  {classLabel(classNum)}
                </span>
                {classNum === 9 && (
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Live
                  </span>
                )}
                {classNum !== 9 && count > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {count === 1 ? "1 Subject" : `${count} Subjects`}
                  </span>
                )}
                {classNum !== 9 && count === 0 && (
                  <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Active
                  </span>
                )}
              </div>
              {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
