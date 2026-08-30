import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPeople, updateUserRole } from "@/lib/admin.functions";
import { getUserDetail } from "@/lib/profile.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { classLabel } from "@/lib/classes";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Easy Padhai" },
      { name: "description", content: "Manage Easy Padhai learners, teachers and role assignments." },
      { property: "og:title", content: "Admin — Easy Padhai" },
      { property: "og:description", content: "User management and role assignment for Easy Padhai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ROLES = ["student", "teacher", "admin"] as const;

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchPeople = useServerFn(getPeople);
  const setRole = useServerFn(updateUserRole);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["people"],
    queryFn: () => fetchPeople(),
    enabled: Boolean(user) && isAdmin,
  });

  if (loading) return <Shell>Loading…</Shell>;
  if (user && !isAdmin) return <Shell>Admin access required.</Shell>;

  async function change(userId: string, role: (typeof ROLES)[number]) {
    try {
      await setRole({ data: { userId, role } });
      await qc.invalidateQueries({ queryKey: ["people"] });
      toast.success("Role updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update role");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-muted-foreground">
        Manage roles and view learner progress. Content lives in{" "}
        <Link to="/teach" className="text-primary underline-offset-4 hover:underline">
          Studio
        </Link>
        .
      </p>

      <Card className="mt-6 rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">People</CardTitle>
          <CardDescription>{data?.length ?? 0} registered users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {(data ?? []).map((p) => (
            <div key={p.id} className="rounded-2xl bg-secondary px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => setOpenId((prev) => (prev === p.id ? null : p.id))}
                >
                  <p className="font-medium underline-offset-4 hover:underline">
                    {p.full_name ?? "Learner"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {classLabel(p.class_level)} · {p.total_xp ?? 0} XP
                  </p>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  {p.roles.map((r) => (
                    <Badge key={r} className="rounded-full text-xs">
                      {r}
                    </Badge>
                  ))}
                  {ROLES.map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs"
                      disabled={p.roles.includes(r)}
                      onClick={() => change(p.id, r)}
                    >
                      Make {r}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full text-xs"
                    onClick={() => setOpenId((prev) => (prev === p.id ? null : p.id))}
                  >
                    {openId === p.id ? "Hide details" : "View details"}
                  </Button>
                </div>
              </div>

              {openId === p.id && <UserDetail userId={p.id} />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function UserDetail({ userId }: { userId: string }) {
  const fetchDetail = useServerFn(getUserDetail);
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-detail", userId],
    queryFn: () => fetchDetail({ data: { userId } }),
  });

  if (isLoading) return <p className="mt-3 text-sm text-muted-foreground">Loading profile…</p>;
  if (error || !data)
    return <p className="mt-3 text-sm text-destructive">Could not load this user's details.</p>;

  const p = data.profile;

  return (
    <div className="mt-4 space-y-4 rounded-2xl bg-background p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Credits" value={p.credits ?? 0} />
        <Stat label="XP" value={p.total_xp ?? 0} />
        <Stat label="Streak" value={`${data.streak?.current_streak ?? 0} d`} />
        <Stat label="Lessons done" value={data.lessonsCompleted} />
      </div>

      <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Row label="Email" value={data.email} />
        <Row label="Mobile" value={p.phone ?? data.authPhone} />
        <Row label="Parent mobile" value={p.guardian_phone} />
        <Row label="Class" value={p.class_level ? classLabel(p.class_level) : null} />
        <Row label="Board" value={p.board} />
        <Row label="School" value={p.school_name} />
        <Row label="City / State" value={[p.city, p.state].filter(Boolean).join(", ") || null} />
        <Row label="Date of birth" value={p.date_of_birth} />
        <Row label="Gender" value={p.gender} />
        <Row label="Study language" value={p.preferred_language} />
        <Row label="Goal" value={p.goal} />
        <Row label="Referral code" value={p.referral_code} />
        <Row label="Friends joined" value={String(data.referralsQualified)} />
        <Row label="Credits spent" value={String(data.creditsSpent)} />
        <Row label="Signed up with" value={data.provider} />
        <Row label="Joined" value={fmt(p.created_at)} />
        <Row label="Last sign-in" value={fmt(data.lastSignInAt)} />
        <Row label="Profile form" value={p.onboarding_completed ? "Completed" : "Pending"} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListBlock title="Recent lessons" empty="No lessons completed yet">
          {data.recentLessons.map((l) => (
            <li key={`${l.lessonId}-${l.completedAt}`} className="flex justify-between gap-3">
              <span className="truncate">{l.title}</span>
              <span className="shrink-0 text-muted-foreground">{fmt(l.completedAt)}</span>
            </li>
          ))}
        </ListBlock>

        <ListBlock title="Test attempts" empty="No tests attempted yet">
          {data.attempts.map((a) => (
            <li key={a.id} className="flex justify-between gap-3">
              <span className="truncate">{a.title}</span>
              <span className="shrink-0 text-muted-foreground">
                {a.score}/{a.total} · {fmt(a.createdAt)}
              </span>
            </li>
          ))}
        </ListBlock>

        <ListBlock title="Credit history" empty="No credit activity yet">
          {data.creditEvents.map((c, i) => (
            <li key={`${c.created_at}-${i}`} className="flex justify-between gap-3">
              <span className="truncate">{c.reason}</span>
              <span className={c.delta >= 0 ? "shrink-0 text-success" : "shrink-0 text-destructive"}>
                {c.delta >= 0 ? "+" : ""}
                {c.delta}
              </span>
            </li>
          ))}
        </ListBlock>

        <ListBlock title="Badges" empty="No badges yet">
          {data.badges.map((b) => (
            <li key={b.badge_code} className="flex justify-between gap-3">
              <span>{b.badge_code}</span>
              <span className="text-muted-foreground">{fmt(b.earned_at)}</span>
            </li>
          ))}
        </ListBlock>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-secondary px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  );
}

function ListBlock({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.flat().filter(Boolean).length === 0;
  return (
    <div className="rounded-2xl border border-border/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-1 text-sm">{children}</ul>
      )}
    </div>
  );
}

function fmt(value: string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-4xl px-4 py-16 text-muted-foreground">{children}</div>;
}
