"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChartIcon, BarChart3 } from "lucide-react";
import { formatMonth } from "../types";
import type { ChartData, RoleDistribution, TopCourse } from "../types";

const ROLE_PIE_COLORS = ["#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground" style={{ color: p.color }}>
          {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function mergedMonthData(chart: ChartData) {
  const map = new Map<string, { month: string; inscriptions: number; utilisateurs: number }>();
  chart.enrollmentsByMonth.forEach((d) =>
    map.set(d.month, { month: d.month, inscriptions: d.count, utilisateurs: 0 }),
  );
  chart.usersByMonth.forEach((d) => {
    const existing = map.get(d.month);
    if (existing) existing.utilisateurs = d.count;
    else map.set(d.month, { month: d.month, inscriptions: 0, utilisateurs: d.count });
  });
  return Array.from(map.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((d) => ({ ...d, mois: formatMonth(d.month) }));
}

export function EnrollmentTrendChart({ data }: { data: ChartData }) {
  const merged = mergedMonthData(data);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Tendances inscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {merged.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={merged}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mois" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="inscriptions" name="Inscriptions"
                stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="utilisateurs" name="Nouveaux utilisateurs"
                stroke="#06B6D4" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RoleDistributionChart({ data }: { data: RoleDistribution[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <PieChartIcon className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Répartition par rôle</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={100}
                dataKey="count" nameKey="role" paddingAngle={2}
                label={({ role, count }) => `${role} (${Math.round((count / total) * 100)}%)`}>
                {data.map((_, i) => (
                  <Cell key={i} fill={ROLE_PIE_COLORS[i % ROLE_PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function TopCoursesChart({ data }: { data: TopCourse[] }) {
  const top = [...data].sort((a, b) => b._count.enrollments - a._count.enrollments).slice(0, 5);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Top 5 cours par inscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune donnée disponible</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis type="category" dataKey="title" width={140}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="_count.enrollments" name="Inscriptions" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
