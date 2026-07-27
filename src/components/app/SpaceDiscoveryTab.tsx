import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Newspaper, GraduationCap, Calendar, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo, type Post } from "@/lib/feed";
import { formatEventDate, fetchEvents, type EventRow } from "@/lib/events";
import { fetchResources, type Resource } from "@/lib/resources";
import type { Course } from "@/lib/courses";

/**
 * Space "Discovery" tab — surfaces the single most relevant item of each kind in
 * this Space (top discussion, a course, the next event, latest resources). All
 * four read live data scoped to the Space; RLS decides what the member can see.
 */
export function SpaceDiscoveryTab({ spaceId, spaceName }: { spaceId: string; spaceName: string }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [postAuthor, setPostAuthor] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessonCount, setLessonCount] = useState(0);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const sb = supabase as any;
      const [postRes, courseRes, events, res] = await Promise.all([
        // Featured first, then pinned, then newest.
        sb.from("posts").select("*")
          .eq("space_id", spaceId).eq("status", "active")
          .order("is_featured", { ascending: false })
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1),
        sb.from("courses").select("*")
          .eq("space_id", spaceId).eq("is_archived", false)
          .order("sort_order").limit(1),
        fetchEvents({ spaceId, upcomingOnly: true }).catch(() => [] as EventRow[]),
        fetchResources({ spaceId }).catch(() => [] as Resource[]),
      ]);
      if (!active) return;

      const p = (postRes?.data?.[0] ?? null) as Post | null;
      setPost(p);
      const c = (courseRes?.data?.[0] ?? null) as Course | null;
      setCourse(c);
      setEvent(events.find((e) => e.status === "published") ?? null);
      setResources(res.slice(0, 3));

      // Secondary details for the cards.
      const [author, comments, lessons] = await Promise.all([
        p?.author_id
          ? supabase.from("profiles").select("full_name").eq("id", p.author_id).maybeSingle()
          : Promise.resolve({ data: null }),
        p ? sb.from("comments").select("*", { count: "exact", head: true }).eq("post_id", p.id).eq("status", "active")
          : Promise.resolve({ count: 0 }),
        c ? sb.from("lessons").select("*", { count: "exact", head: true }).eq("course_id", c.id)
          : Promise.resolve({ count: 0 }),
      ]);
      if (!active) return;
      setPostAuthor((author as any)?.data?.full_name ?? null);
      setCommentCount((comments as any)?.count ?? 0);
      setLessonCount((lessons as any)?.count ?? 0);
      setLoading(false);
    })().catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [spaceId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const muted = "text-sm text-muted-foreground";

  return (
    <div className="space-y-4">
      <DashboardCard title={`Welcome to ${spaceName}`} icon={<Sparkles className="size-4" />}>
        <p className={muted}>
          Start here to find the most important conversations, lessons, events, and resources in this Space.
        </p>
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Featured discussion */}
        <DashboardCard title="Featured discussion" icon={<Newspaper className="size-4" />}>
          {post ? (
            <div className="space-y-2">
              <Link to="/posts/$postId" params={{ postId: post.id }} className="font-medium hover:underline line-clamp-2 block">
                {post.title || post.body.slice(0, 80) || "Untitled post"}
              </Link>
              {post.title && post.body && <p className={`${muted} line-clamp-2`}>{post.body}</p>}
              <p className="text-xs text-muted-foreground">
                {postAuthor ? `${postAuthor} · ` : ""}{timeAgo(post.created_at)}
                {commentCount > 0 && ` · ${commentCount} comment${commentCount === 1 ? "" : "s"}`}
              </p>
            </div>
          ) : (
            <p className={muted}>No discussions yet — start the first conversation in the Feed tab.</p>
          )}
        </DashboardCard>

        {/* Featured course */}
        <DashboardCard title="Featured course" icon={<GraduationCap className="size-4" />}>
          {course ? (
            <div className="space-y-2">
              <Link to="/courses/$courseId" params={{ courseId: course.id }} className="font-medium hover:underline line-clamp-2 block">
                {course.title}
              </Link>
              {course.description && <p className={`${muted} line-clamp-2`}>{course.description}</p>}
              <p className="text-xs text-muted-foreground">
                {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
              </p>
              <Button asChild size="sm" variant="outline">
                <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                  View course <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className={muted}>No courses in this Space yet.</p>
          )}
        </DashboardCard>

        {/* Upcoming event */}
        <DashboardCard title="Upcoming event" icon={<Calendar className="size-4" />}>
          {event ? (
            <div className="space-y-2">
              <Link to="/events/$eventId" params={{ eventId: event.id }} className="font-medium hover:underline line-clamp-2 block">
                {event.title}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatEventDate(event.start_time, event.timezone)}
              </p>
              {event.location && <p className={`${muted} line-clamp-1`}>{event.location}</p>}
              <Button asChild size="sm" variant="outline">
                <Link to="/events/$eventId" params={{ eventId: event.id }}>
                  View event <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          ) : (
            <p className={muted}>No upcoming events scheduled.</p>
          )}
        </DashboardCard>

        {/* Resources */}
        <DashboardCard title="Resources" icon={<BookOpen className="size-4" />}>
          {resources.length > 0 ? (
            <ul className="space-y-1.5">
              {resources.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/resources/$resourceId"
                    params={{ resourceId: r.id }}
                    className="text-sm hover:underline line-clamp-1 block"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={muted}>No resources shared in this Space yet.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
