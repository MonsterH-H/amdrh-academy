"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  UserCheck, PieChart as PieIcon, BookOpen, BarChart3,
} from "lucide-react";
import { ROLE_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { formatMonth } from "@/modules/admin/analytics/types";
import type { RoleData, MonthData, CategoryData } from "@/modules/admin/analytics/types";
import { EmptyChartState } from "@/modules/admin/analytics/components/empty-chart-state";

// ─── Colors ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#EF4444",
  FORMATEUR: "#8B5CF6",
  ARBITRE: "#06B6D4",
  ENTRAINEUR: "#10B981",
  JOUEUR: "#F59E0B",
};

const CATEGORY_COLORS: Record<string, string> = {
  ARBITRAGE: "#06B6D4",
  ENTRAINEMENT: "#10B981",
  JOUEURS: "#F59E0B",
  ADMINISTRATION: "#8B5CF6",
};

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChartData {
  enrollmentsByMonth: MonthData[];
  usersByRole: RoleData[];
  topCourses: Array<{ title: string; count: number }>;
  scoresByCategory: Array<{ category: string; avgScore: number }>;
}

// ─── Charts Grid ─────────────────────────────────────────────────────────────

export function DashboardCharts({ data }: { data: ChartData }) {
  return (
    <div className="space-y-6">
      {/* Row 1: Area chart + Pie chart */}
      <div className="grid lg:grid-cols-5 gap-6">
        <EnrollmentsAreaChart enrollments={data.enrollmentsByMonth} />
        <RoleDistributionPie roles={data.usersByRole} />
      </div>
      {/* Row 2: Bar charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TopCoursesBarChart courses={data.topCourses} />
        <ScoresByCategoryBarChart scores={data.scoresByCategory} />
      </div>
    </div>
  );
}

// ─── Inscriptions par jour (Area) ────────────────────────────────────────────

function EnrollmentsAreaChart({ enrollments }: { enrollments: MonthData[] }) {
  const chartData = useMemo(
    () => enrollments.map((m) => ({ name: formatMonth(m.month), inscriptions: m.count })),
    [enrollments],
  );

  return (
    <Card className="border-border/60 lg:col-span-3">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-primary" /> Inscriptions par mois
        </h3>
        {chartData.length === 0 ? (
          <EmptyChartState message="Aucune donnée d'inscription" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} inscriptions`, ""]} />
              <Area type="monotone" dataKey="inscriptions" stroke="#1D4ED8" strokeWidth={2.5} fill="url(#enrollGradient)" dot={{ fill: "#1D4ED8", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Répartition par rôle (Pie/Donut) ────────────────────────────────────────

function RoleDistributionPie({ roles }: { roles: RoleData[] }) {
  const pieData = useMemo(() => {
    if (!roles?.length) return [];
    const total = roles.reduce((s, r) => s + (r._count.role ?? 0), 0);
    return roles.map((r) => ({
      name: ROLE_LABELS[r.role] || r.role,
      value: r._count.role ?? 0,
      pct: total > 0 ? Math.round(((r._count.role ?? 0) / total) * 100) : 0,
      role: r.role,
    }));
  }, [roles]);

  return (
    <Card className="border-border/60 lg:col-span-2">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-amber-500" /> Répartition par rôle
        </h3>
        {pieData.length === 0 ? (
          <EmptyChartState message="Aucun utilisateur" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" nameKey="name" stroke="none">
                {pieData.map((entry) => <Cell key={entry.role} fill={ROLE_COLORS[entry.role] || "#6B7280"} />)}
              </Pie>
              <Tooltip formatter={(value: number, _name, props) => [
                `${value} (${((props as Record<string, unknown>).payload as Record<string, unknown>)?.pct}%)`, "Utilisateurs",
              ]} contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: "8px" }}
                formatter={(value: string) => <span className="text-[10px] text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Top 5 cours (Bar) ───────────────────────────────────────────────────────

function TopCoursesBarChart({ courses }: { courses: Array<{ title: string; count: number }> }) {
  const chartData = useMemo(
    () => courses.slice(0, 5).map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title,
      inscriptions: c.count,
    })),
    [courses],
  );

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" /> Top 5 cours
        </h3>
        {chartData.length === 0 ? (
          <EmptyChartState message="Aucun cours" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} inscrits`, ""]} labelFormatter={() => ""} />
              <Bar dataKey="inscriptions" fill="#10B981" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Scores moyens par catégorie (Bar) ───────────────────────────────────────

function ScoresByCategoryBarChart({ scores }: { scores: Array<{ category: string; avgScore: number }> }) {
  const chartData = useMemo(
    () => scores.map((s) => ({
      name: CATEGORY_LABELS[s.category] || s.category,
      score: s.avgScore,
      category: s.category,
    })),
    [scores],
  );

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-500" /> Scores moyens par catégorie
        </h3>
        {chartData.length === 0 ? (
          <EmptyChartState message="Aucune donnée" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Score moyen"]} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry) => <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || "#8B5CF6"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
