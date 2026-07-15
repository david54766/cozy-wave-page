import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// Layout route for everything under /admin. Renders <Outlet/> so child routes
// (/admin/plans, /admin/billing-settings, …) actually display — previously this
// file was the dashboard with no Outlet, so every admin sub-page fell back to
// showing the dashboard. The dashboard now lives in admin.index.tsx.
export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return <Outlet />;
}
