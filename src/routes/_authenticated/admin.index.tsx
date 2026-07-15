import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminStatCard, EmptyState } from "@/components/app/DashboardCard";
import { Users, UserPlus, Activity, Settings, Users2, GraduationCap, Calendar, CreditCard, Sparkles, FolderTree, Plus, ArrowRight, MessageSquare, Shield, CalendarCheck, UserX, BarChart3, ShieldAlert, ListChecks, Award, Trophy, Star, Tag, Clock, Zap, AlertTriangle, FileText, Megaphone, Layers, BookOpen, Mail, Package, Bot, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getIcon, type Space } from "@/lib/spaces";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, newWeek: 0, active: 0, spaces: 0, collections: 0, events: 0, upcomingEvents: 0, rsvps: 0, suspended: 0, newMonth: 0, openReports: 0, totalPlans: 0, activePlans: 0, featuredPlan: "—", billingConfigured: false, totalAutomations: 0, activeAutomations: 0, failedLogs: 0, activeSegments: 0, sentAnnouncements: 0, draftAnnouncements: 0, aiOutlines: 0, aiLessons: 0, aiConverted: 0, pendingInvites: 0, inviteLinks: 0, certsIssued: 0 });
  const [recent, setRecent] = useState<Space[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const monthAgo = new Date(Date.now() - 30 * 86400_000).toISOString();
      const nowIso = new Date().toISOString();
      const [{ count: total }, { count: newWeek }, { count: active }, { count: spacesCount }, { count: collectionsCount }, { data: recentSpaces }, { count: eventsCount }, { count: upcomingCount }, { count: rsvpCount }, { count: suspended }, { count: newMonth }, { count: openReports }, { data: plansData }, { data: billingData }, { count: totalAutomations }, { count: activeAutomations }, { count: failedLogs }, { count: activeSegments }, { count: sentAnnouncements }, { count: draftAnnouncements }, { count: aiOutlines }, { count: aiLessons }, { count: aiConverted }, { count: pendingInvites }, { count: inviteLinks }, { count: certsIssued }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("last_active_at", weekAgo),
        supabase.from("spaces").select("*", { count: "exact", head: true }).eq("is_archived", false),
        supabase.from("collections").select("*", { count: "exact", head: true }),
        supabase.from("spaces").select("*").order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("events").select("*", { count: "exact", head: true }),
        (supabase as any).from("events").select("*", { count: "exact", head: true }).gte("end_time", nowIso),
        (supabase as any).from("event_rsvps").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "suspended"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo),
        supabase.from("reports").select("*", { count: "exact", head: true }).in("status", ["open", "under_review", "pending"]),
        (supabase as any).from("plans").select("name,active,featured"),
        (supabase as any).from("billing_settings").select("stripe_publishable_key").limit(1).maybeSingle(),
        (supabase as any).from("automations").select("*", { count: "exact", head: true }),
        (supabase as any).from("automations").select("*", { count: "exact", head: true }).eq("active", true),
        (supabase as any).from("automation_logs").select("*", { count: "exact", head: true }).eq("status", "failed"),
        (supabase as any).from("segments").select("*", { count: "exact", head: true }).eq("active", true),
        (supabase as any).from("admin_announcements").select("*", { count: "exact", head: true }).eq("status", "sent"),
        (supabase as any).from("admin_announcements").select("*", { count: "exact", head: true }).eq("status", "draft"),
        (supabase as any).from("ai_course_generations").select("*", { count: "exact", head: true }),
        (supabase as any).from("ai_lesson_generations").select("*", { count: "exact", head: true }),
        (supabase as any).from("ai_course_generations").select("*", { count: "exact", head: true }).eq("status", "converted"),
        (supabase as any).from("invitations").select("*", { count: "exact", head: true }).eq("status", "pending"),
        (supabase as any).from("invite_links").select("*", { count: "exact", head: true }).eq("active", true),
        (supabase as any).from("user_certificates").select("*", { count: "exact", head: true }),
      ]);
      const plans = (plansData ?? []) as { name: string; active: boolean; featured: boolean }[];
      setStats({
        total: total ?? 0,
        newWeek: newWeek ?? 0,
        active: active ?? 0,
        spaces: spacesCount ?? 0,
        collections: collectionsCount ?? 0,
        events: eventsCount ?? 0,
        upcomingEvents: upcomingCount ?? 0,
        rsvps: rsvpCount ?? 0,
        suspended: suspended ?? 0,
        newMonth: newMonth ?? 0,
        openReports: openReports ?? 0,
        totalPlans: plans.length,
        activePlans: plans.filter((p) => p.active).length,
        featuredPlan: plans.find((p) => p.featured)?.name ?? "—",
        billingConfigured: !!billingData?.stripe_publishable_key,
        totalAutomations: totalAutomations ?? 0,
        activeAutomations: activeAutomations ?? 0,
        failedLogs: failedLogs ?? 0,
        activeSegments: activeSegments ?? 0,
        sentAnnouncements: sentAnnouncements ?? 0,
        draftAnnouncements: draftAnnouncements ?? 0,
        aiOutlines: aiOutlines ?? 0,
        aiLessons: aiLessons ?? 0,
        aiConverted: aiConverted ?? 0,
        pendingInvites: pendingInvites ?? 0,
        inviteLinks: inviteLinks ?? 0,
        certsIssued: certsIssued ?? 0,
      });
      setRecent((recentSpaces ?? []) as Space[]);
    })();
  }, [isAdmin]);

  if (!isAdmin) return null;

  type AdminLink = { to: string; label: string; icon: LucideIcon; badge?: number; status?: string };
  const sections: { title: string; icon: LucideIcon; links: AdminLink[] }[] = [
    {
      title: "Members & Access", icon: Users, links: [
        { to: "/admin/members", label: "Members", icon: Users },
        { to: "/admin/invitations", label: "Invitations", icon: Mail, badge: stats.pendingInvites },
        { to: "/admin/segments", label: "Segments", icon: Layers },
        { to: "/admin/access", label: "Access grants", icon: Shield },
        { to: "/admin/moderation", label: "Moderation", icon: ShieldAlert, badge: stats.openReports },
        { to: "/admin/audit-logs", label: "Audit logs", icon: FileText },
      ],
    },
    {
      title: "Content", icon: BookOpen, links: [
        { to: "/admin/spaces", label: "Spaces", icon: Users2 },
        { to: "/admin/collections", label: "Collections", icon: FolderTree },
        { to: "/admin/courses", label: "Courses", icon: GraduationCap },
        { to: "/admin/events", label: "Events", icon: Calendar },
        { to: "/admin/posts", label: "Posts", icon: MessageSquare },
        { to: "/admin/resources", label: "Resources", icon: BookOpen },
        { to: "/admin/resource-folders", label: "Resource folders", icon: FolderTree },
        { to: "/admin/announcements", label: "Announcements", icon: Megaphone, badge: stats.draftAnnouncements },
        { to: "/admin/certificates", label: "Certificates", icon: Award },
      ],
    },
    {
      title: "Billing & Revenue", icon: CreditCard, links: [
        { to: "/admin/plans", label: "Plans", icon: CreditCard },
        { to: "/admin/bundles", label: "Bundles", icon: Package },
        { to: "/admin/coupons", label: "Coupons", icon: Tag },
        { to: "/admin/trials", label: "Trials", icon: Clock },
        { to: "/admin/subscribers", label: "Subscribers", icon: Users },
        { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
        { to: "/admin/payment-events", label: "Payment events", icon: Activity },
        { to: "/admin/revenue", label: "Revenue", icon: BarChart3 },
        { to: "/admin/billing-settings", label: "Billing settings", icon: Settings, status: stats.billingConfigured ? "Ready" : "Setup" },
      ],
    },
    {
      title: "Engagement", icon: Trophy, links: [
        { to: "/admin/badges", label: "Badges", icon: Award },
        { to: "/admin/points", label: "Points", icon: Trophy },
        { to: "/admin/checklist", label: "Onboarding checklist", icon: ListChecks },
      ],
    },
    {
      title: "AI Tools", icon: Sparkles, links: [
        { to: "/admin/ai-assistant", label: "AI Assistant", icon: Sparkles },
        { to: "/admin/ai-course-builder", label: "AI Course Builder", icon: Sparkles },
        { to: "/admin/ai-course-generations", label: "AI Generations", icon: FileText },
        { to: "/admin/ai-drafts", label: "AI Drafts", icon: FileText },
        { to: "/admin/ai-member-insights", label: "Member Insights", icon: Sparkles },
        { to: "/admin/ai-content-sources", label: "Content Sources", icon: FileText },
        { to: "/admin/ai-settings", label: "AI Settings", icon: Bot },
        { to: "/admin/ai-helper-settings", label: "AI Helper Settings", icon: Bot },
      ],
    },
    {
      title: "Automation & Analytics", icon: Zap, links: [
        { to: "/admin/automations", label: "Automations", icon: Zap },
        { to: "/admin/automation-logs", label: "Automation logs", icon: AlertTriangle, badge: stats.failedLogs },
        { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage members, content, engagement, billing, and growth from one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex">
          <Button asChild><Link to="/admin/spaces"><Plus className="size-4 mr-1.5" />Create Space</Link></Button>
          <Button variant="outline" asChild><Link to="/admin/invitations"><Mail className="size-4 mr-1.5" />Invite Member</Link></Button>
          <Button variant="outline" asChild><Link to="/admin/settings"><Settings className="size-4 mr-1.5" />Settings</Link></Button>
        </div>
      </header>

      {/* Key metrics — the numbers worth glancing at daily. */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard label="Members" value={stats.total} hint={`+${stats.newMonth} in 30d`} icon={<Users className="size-4 text-muted-foreground" />} />
        <AdminStatCard label="Active (7d)" value={stats.active} icon={<Activity className="size-4 text-muted-foreground" />} />
        <AdminStatCard label="Open Reports" value={stats.openReports} icon={<ShieldAlert className="size-4 text-muted-foreground" />} />
        <AdminStatCard label="Pending Invites" value={stats.pendingInvites} icon={<Mail className="size-4 text-muted-foreground" />} />
        <AdminStatCard label="Spaces" value={stats.spaces} icon={<Users2 className="size-4 text-muted-foreground" />} />
        <AdminStatCard label="Billing" value={stats.billingConfigured ? "Ready" : "Setup"} icon={<CreditCard className="size-4 text-muted-foreground" />} />
      </div>

      {/* Organized navigation into every admin area. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title} className="rounded-2xl">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <section.icon className="size-4" />
                </div>
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <ul className="space-y-0.5">
                {section.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to as string}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground/90 hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <l.icon className="size-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{l.label}</span>
                      {typeof l.badge === "number" && l.badge > 0 && (
                        <span className="text-[10px] font-semibold rounded-full bg-primary/10 text-primary px-1.5 py-0.5">{l.badge}</span>
                      )}
                      {l.status && (
                        <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 ${l.status === "Ready" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"}`}>{l.status}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently created Spaces</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/spaces">Manage all <ArrowRight className="size-4 ml-1" /></Link>
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Users2 className="size-5" />}
            title="No Spaces yet"
            description="Create your first Space to get started."
            action={<Button asChild><Link to="/admin/spaces"><Plus className="size-4 mr-1.5" />Create Space</Link></Button>}
          />
        ) : (
          <ul className="space-y-2">
            {recent.map((s) => {
              const Icon = getIcon(s.icon);
              return (
                <li key={s.id}>
                  <Card className="rounded-2xl">
                    <CardContent className="pt-5 flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Icon className="size-5" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        {s.tagline && <p className="text-sm text-muted-foreground line-clamp-1">{s.tagline}</p>}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/spaces/$spaceId" params={{ spaceId: s.id }}>Manage</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </div>
  );
}