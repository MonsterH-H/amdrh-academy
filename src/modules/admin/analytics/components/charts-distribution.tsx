"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, BookOpen, PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import { ROLE_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { ROLE_CHART_COLORS, CATEGORY_CHART_COLORS, formatMonthFull, formatMonth, tooltipStyle } from "../types";
import type { StatsData } from "../types";
import { EmptyChartState } from "./empty-chart-state";

// ─── Distribution Charts (Row 3) ─────────────────────────────────────────────

export function DistributionCharts({ data }: { data: StatsData }) {
  const { usersByRole, usersByMonth, coursesByCategory } = data;

  const rolePieData = useMemo(() => {
    if (!usersByRole?.length) return [];
    const total = usersByRole.reduce((s, r) => s + (r._count.role ?? 0), 0);
    return usersByRole.map((r) => ({
      name: ROLE_LABELS[r.role] || r.role,
      value: r._count.role ?? 0,
      pct: total > 0 ? Math.round(((r._count.role ?? 0) / total) * 100) : 0,
      role: r.role,
    }));
  }, [usersByRole]);

  const registrationLineData = useMemo(
    () => usersByMonth.map((m) => ({ name: formatMonth(m.month), month: m.month, inscriptions: m.count })),
    [usersByMonth],
  );

  const categoryBarData = useMemo(
    () => coursesByCategory.map((c) => ({ name: CATEGORY_LABELS[c.category] || c.category, category: c.category, cours: c._count.category })),
    [coursesByCategory],
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Role Distribution Pie */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary" /> Répartition des rôles
          </h3>
          {rolePieData.length === 0 ? (
            <EmptyChartState message="Aucun utilisateur" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                  {rolePieData.map((entry) => <Cell key={entry.role} fill={ROLE_CHART_COLORS[entry.role] || "#6B7280"} />)}
                </Pie>
                <Tooltip formatter={(value, _name, props) => [
                  `${value} (${((props as Record<string, unknown>).payload as Record<string, unknown>)?.pct}%)`, "Utilisateurs",
                ]} contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: "8px" }}
                  formatter={(value: string) => <span className="text-[10px] text-muted-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* New Registrations Line */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" /> Nouvelles inscriptions
          </h3>
          {registrationLineData.length === 0 ? (
            <EmptyChartState message="Aucune donnée" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={registrationLineData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, props) => [
                  `${value} inscrits`, formatMonthFull(((props as Record<string, unknown>).payload as Record<string, unknown>)?.month as string),
                ]} labelFormatter={() => ""} />
                <Line type="monotone" dataKey="inscriptions" stroke="#06B6D4" strokeWidth={2.5}
                  dot={{ fill: "#06B6D4", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Courses by Category Bar */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" /> Cours par catégorie
          </h3>
          {categoryBarData.length === 0 ? (
            <EmptyChartState message="Aucun cours" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryBarData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} cours`, "Nombre"]} labelFormatter={() => ""} />
                <Bar dataKey="cours" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {categoryBarData.map((entry) => <Cell key={entry.category} fill={CATEGORY_CHART_COLORS[entry.category] || "#6B7280"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
