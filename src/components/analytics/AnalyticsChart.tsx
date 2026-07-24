import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export interface ChartPoint {
  label: string;
  value: number;
}

/** Real time-series chart (area). Shows an honest empty state when there's no data. */
export function AnalyticsChart({
  title,
  data,
  prefix = "",
  loading = false,
}: {
  title: string;
  data: ChartPoint[];
  prefix?: string;
  loading?: boolean;
}) {
  const gid = `grad-${title.replace(/[^a-zA-Z0-9]/g, "")}`;
  const hasData = data.some((d) => d.value > 0);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="size-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />
        ) : !hasData ? (
          <div className="h-40 rounded-xl border border-dashed border-muted-foreground/30 grid place-items-center text-xs text-muted-foreground">
            No data yet
          </div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  tickFormatter={(v) => `${prefix}${v}`}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(v: number | string) => [`${prefix}${v}`, title]}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill={`url(#${gid})`} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
