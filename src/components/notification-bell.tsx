import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  GraduationCap,
  Megaphone,
  Sparkles,
  Zap,
  ExternalLink,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/hooks/use-active-class";
import {
  getMyNotifications,
  markReadFn,
  markAllReadFn,
} from "@/lib/notifications.functions";
import { cn } from "@/lib/utils";

function formatRelativeTime(dateString: string): string {
  try {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return "Yesterday";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function NotificationBell({ className }: { className?: string }) {
  const { user } = useAuth();
  const { activeClass } = useActiveClass();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const fetchNotifications = useServerFn(getMyNotifications);
  const markRead = useServerFn(markReadFn);
  const markAllRead = useServerFn(markAllReadFn);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Query notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["my-notifications", user?.id, activeClass],
    queryFn: () =>
      fetchNotifications({
        data: {
          userId: user?.id ?? null,
          classLevel: activeClass,
        },
      }),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleItemClick = async (notif: (typeof notifications)[0]) => {
    if (user && !notif.is_read) {
      void markRead({ data: { notificationId: notif.id, userId: user.id } });
      // Optimistic update in cache
      qc.setQueryData(
        ["my-notifications", user?.id, activeClass],
        (old: any) =>
          Array.isArray(old)
            ? old.map((n: any) =>
                n.id === notif.id ? { ...n, is_read: true } : n,
              )
            : old,
      );
    }
    setOpen(false);
    if (notif.action_url) {
      try {
        void navigate({ to: notif.action_url as any });
      } catch {
        window.location.href = notif.action_url;
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllRead({
        data: { userId: user.id, classLevel: activeClass },
      });
      qc.setQueryData(
        ["my-notifications", user.id, activeClass],
        (old: any) =>
          Array.isArray(old)
            ? old.map((n: any) => ({ ...n, is_read: true }))
            : old,
      );
    } catch (err) {
      console.warn("Could not mark all as read:", err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "lecture":
        return {
          icon: GraduationCap,
          color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
          label: "Lecture",
        };
      case "chapter":
        return {
          icon: Zap,
          color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          label: "Chapter",
        };
      case "challenge":
        return {
          icon: Sparkles,
          color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
          label: "Quiz",
        };
      default:
        return {
          icon: Megaphone,
          color: "text-primary bg-primary/10 border-primary/20",
          label: "Update",
        };
    }
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Announcements & Lecture Alerts"
        className={cn(
          "relative grid size-8 sm:size-9 place-items-center rounded-xl border transition-all shadow-xs cursor-pointer",
          open
            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
            : "border-border/80 bg-secondary/60 text-foreground hover:bg-secondary hover:text-primary",
        )}
      >
        <Bell className="size-4 sm:size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl p-0 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && user && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3 text-emerald-500" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="grid size-12 place-items-center rounded-full bg-muted/50 mb-3 border border-border/60">
                  <Bell className="size-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  No notifications yet!
                </p>
                <p className="text-[11px] text-muted-foreground max-w-[220px] mt-1">
                  When new lectures, chapter tests, or Sir's updates go live, they
                  will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const badge = getTypeBadge(notif.type);
                const IconComponent = badge.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left hover:bg-secondary/50",
                      !notif.is_read
                        ? "bg-primary/5 dark:bg-primary/10"
                        : "bg-background",
                    )}
                  >
                    {/* Badge Icon */}
                    <div
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-xl border mt-0.5",
                        badge.color,
                      )}
                    >
                      <IconComponent className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs line-clamp-1",
                            !notif.is_read
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground/90",
                          )}
                        >
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground font-medium">
                        <span>{formatRelativeTime(notif.created_at)}</span>
                        {notif.action_url && (
                          <span className="inline-flex items-center gap-0.5 text-primary font-semibold hover:underline">
                            Open <ExternalLink className="size-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="bg-muted/20 px-3.5 py-2 text-center text-[10px] text-muted-foreground border-t border-border/40">
            Easy Padhai Real-time Learning Engine ⚡
          </div>
        </div>
      )}
    </div>
  );
}
