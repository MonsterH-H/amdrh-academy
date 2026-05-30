"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, PieChart as PieChartIcon, UserCheck, Award, GraduationCap, CheckCircle2 } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar,
  LineChart, Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { ROLE_CHART_COLORS, CATEGORY_CHART_COLORS, formatMonthFull, formatMonth, tooltipStyle } from "../types";
import type { StatsData } from "../types";
import { DistributionCharts } from "./charts-distribution";
import { EmptyChartState } from "./empty-chart-state";

// ─── Charts Section ──────────────────────────────────────────────────────────

export function ChartsSection({ data }: { data: StatsData }) {
  const { overview, usersByMonth, enrollmentsByMonth, certificatesByMonth } = data;

  const quizPieData = useMemo(() => {
    const items: Array<{ name: string; value: number; fill: string }> = [];
    if (overview.passedAttempts > 0) items.push({ name: "Réussis", value: overview.passedAttempts, fill: "#2563EB" });
    if (overview.failedAttempts > 0) items.push({ name: "Échoués", value: overview.failedAttempts, fill: "#EF4444" });
    if (items.length === 0) return [{ name: "Aucune tentative", value: 1, fill: "#94a3b8" }];
    return items;
  }, [overview.passedAttempts, overview.failedAttempts]);

  const enrollmentBarData = useMemo(
    () => enrollmentsByMonth.map((m) => ({ name: formatMonth(m.month), month: m.month, inscriptions: m.count })),
    [enrollmentsByMonth],
  );

  const certificateLineData = useMemo(
    () => certificatesByMonth.map((m) => ({ name: formatMonth(m.month), month: m.month, certificats: m.count })),
    [certificatesByMonth],
  );

  const completionRadialData = useMemo(
    () => [{ name: "Complétion", value: overview.completionRate, fill: "#2563EB" }],
    [overview.completionRate],
  );

  return (
    <div className="space-y-6">
      {/* Row 1: Completion Rate + Quiz Pass Rate */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Taux de complétion
            </h3>
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="55%" outerRadius="90%" data={completionRadialData} startAngle={180} endAngle={0} barSize={12}>
                    <RadialBar background={{ fill: "#f1f5f9" }} dataKey="value" cornerRadius={6} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-3xl font-bold text-foreground">{overview.completionRate}<span className="text-base font-medium text-muted-foreground">%</span></p>
                <Progress value={overview.completionRate} className="h-2.5" />
                <p className="text-sm text-muted-foreground">
                  {overview.completionRate >= 60 ? "Excellent ! Les apprenants terminent leurs parcours."
                    : overview.completionRate >= 30 ? "Bonne progression. Continuez à motiver."
                    : "Encouragez les apprenants à terminer."}
                </p>
                <div className="flex gap-6 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{overview.completedEnrollments} terminés</span>
                  <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-violet-500" />{overview.totalEnrollments} inscriptions</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" /> Taux de réussite quiz
            </h3>
            {quizPieData.length === 0 ? (
              <EmptyChartState message="Aucune tentative de quiz" />
            ) : (
              <div className="flex items-center gap-6">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={quizPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                        {quizPieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{overview.quizPassRate}<span className="text-base font-medium text-muted-foreground">%</span></p>
                    <p className="text-xs text-muted-foreground">de réussite</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn("w-2.5 h-2.5 rounded-full", "bg-green-500")} />
                      <span className="text-xs text-muted-foreground">{overview.passedAttempts} réussi{overview.passedAttempts > 1 ? "s" : ""}</span>
                    </div>
                    {overview.failedAttempts > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={cn("w-2.5 h-2.5 rounded-full", "bg-red-500")} />
                        <span className="text-xs text-muted-foreground">{overview.failedAttempts} échec{overview.failedAttempts > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Sur {overview.totalQuizAttempts} tentative{overview.totalQuizAttempts > 1 ? "s" : ""} au total
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Enrollments by Month + Certificates by Month */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-500" /> Inscriptions par mois
            </h3>
            {enrollmentBarData.length === 0 ? (
              <EmptyChartState message="Aucune donnée d'inscription" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={enrollmentBarData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, props) => [
                    `${value} inscriptions`, formatMonthFull(((props as Record<string, unknown>).payload as Record<string, unknown>)?.month as string),
                  ]} labelFormatter={() => ""} />
                  <Bar dataKey="inscriptions" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" /> Certificats par mois
            </h3>
            {certificateLineData.length === 0 ? (
              <EmptyChartState message="Aucun certificat délivré" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={certificateLineData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, _name, props) => [
                    `${value} certificats`, formatMonthFull(((props as Record<string, unknown>).payload as Record<string, unknown>)?.month as string),
                  ]} labelFormatter={() => ""} />
                  <Line type="monotone" dataKey="certificats" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Role Distribution + Registrations + Categories */}
      <DistributionCharts data={data} />
    </div>
  );
}
