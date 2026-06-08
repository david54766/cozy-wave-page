import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { triggerLabel, type AutomationLog, type AutomationLogStatus } from "@/lib/automations";
import { AutomationLogDetailModal } from "./AutomationLogDetailModal";

const statusVariant: Record<AutomationLogStatus, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  pending: "secondary",
  skipped: "outline",
  failed: "destructive",
};

interface Props {
  rows: AutomationLog[];
  automationNames?: Record<string, string>;
}

export function AutomationLogsTable({ rows, automationNames = {} }: Props) {
  const [selected, setSelected] = useState<AutomationLog | null>(null);
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No logs yet.</p>;
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Automation</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>When</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{automationNames[l.automation_id] ?? l.automation_id.slice(0, 8)}</TableCell>
              <TableCell className="text-sm">{triggerLabel(l.trigger_type)}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{l.user_id ? l.user_id.slice(0, 8) : "—"}</TableCell>
              <TableCell><Badge variant={statusVariant[l.status]}>{l.status}</Badge></TableCell>
              <TableCell className="text-xs text-destructive max-w-[240px] truncate">{l.error_message ?? ""}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={() => setSelected(l)}>Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AutomationLogDetailModal log={selected} onOpenChange={() => setSelected(null)} automationName={selected ? automationNames[selected.automation_id] : undefined} />
    </>
  );
}