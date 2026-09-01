import { GraduationCap, Check, ChevronDown } from "lucide-react";
import { useActiveClass } from "@/hooks/use-active-class";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "h-8.5 inline-flex items-center gap-1.5 rounded-full border-primary/30 bg-primary/5 px-3 text-xs font-bold text-primary hover:bg-primary/10 hover:text-primary shadow-xs",
            className,
          )}
        >
          <GraduationCap className="size-3.5 text-primary" />
          <span>{classLabel(activeClass)}</span>
          <ChevronDown className="size-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border-border/80">
        <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Select Your Class
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allClasses.map((classNum) => {
          const isSelected = activeClass === classNum;
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
                {classNum === 10 && (
                  <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    2 Subjects
                  </span>
                )}
                {classNum === 11 && (
                  <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    4 Subjects
                  </span>
                )}
                {classNum === 12 && (
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Physics
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
