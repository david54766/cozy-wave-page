import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { fetchResources, type Resource } from "@/lib/resources";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { EmptyState } from "./DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";

/** Resources shared in a Space — real list (RLS scopes what the member can see). */
export function SpaceResourcesTab({ spaceId }: { spaceId: string }) {
  const [resources, setResources] = useState<Resource[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchResources({ spaceId })
      .then((r) => active && setResources(r))
      .catch(() => active && setResources([]));
    return () => { active = false; };
  }, [spaceId]);

  if (resources === null) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="size-5" />}
        title="No resources yet"
        description="Templates, files, and links shared in this Space will appear here."
      />
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
    </div>
  );
}
