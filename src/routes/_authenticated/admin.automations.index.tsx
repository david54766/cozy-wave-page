import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";
import { fetchAutomations, type Automation } from "@/lib/automations";
import { AutomationTable } from "@/components/automations/AutomationTable";

export const Route = createFileRoute("/_authenticated/admin/automations/")({ component: Page });

function Page() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Automation[]>([]);

  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/dashboard" }); }, [loading, isAdmin, navigate]);
  const load = async () => setRows(await fetchAutomations());
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Automations</h1>
          <p className="text-muted-foreground mt-1">Create simple rules that help manage engagement, onboarding, access, and member activity automatically.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/admin/automation-logs">View logs</Link></Button>
          <Button asChild><Link to="/admin/automations/new"><Plus className="size-4 mr-1.5" />New automation</Link></Button>
        </div>
      </header>
      <Card className="rounded-2xl">
        <CardHeader><h2 className="font-semibold">{rows.length} automation{rows.length === 1 ? "" : "s"}</h2></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-12 text-sm">
              <div className="mx-auto size-12 rounded-2xl bg-muted grid place-items-center mb-3"><Bot className="size-6 text-muted-foreground" /></div>
              <p className="text-muted-foreground mb-4">No automations have been created yet. Start with a simple welcome or engagement rule.</p>
              <Button asChild><Link to="/admin/automations/new"><Plus className="size-4 mr-1.5" />Create automation</Link></Button>
            </div>
          ) : (
            <AutomationTable rows={rows} onChanged={load} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}