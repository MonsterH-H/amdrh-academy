"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  TrendingUp,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Target,
  PieChart as PieChartIcon,
  Activity,
  MessageSquare,
  Calendar,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { ROLE_LABELS, CATEGORY_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatsOverview {
  totalUsers: number;
  totalActiveUsers: number;
  activeDays: number;
  totalCourses: number;
  totalPublishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalCertificates: number;
  totalQuizAttempts: number;
  quizPassRate: number;
  quizFailRate: number;
  passedAttempts: number;
  failedAttempts: number;
  totalBadges: number;
  totalMessages: number;
}

interface RoleData {
  role: string;
  _count: { role: number };
}

interface MonthData {
  month: string;
  count: number;
}

interface CategoryData {
  category: string;
  _count: { category: number };
}

interface StatsData {
  overview: StatsOverview;
  usersByRole: RoleData[];
  usersByMonth: MonthData[];
  enrollmentsByMonth: MonthData[];
  certificatesByMonth: MonthData[];
  coursesByCategory: CategoryData[];
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const CHART_COLORS = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899"];

const ROLE_CHART_COLORS: Record<string, string> = {
  ADMIN: "#EF4444",
  FORMATEUR: "#8B5CF6",
  ARBITRE: "#06B6D4",
  ENTRAINEUR: "#10B981",
  JOUEUR: "#F59E0B",
};

const CATEGORY_CHART_COLORS: Record<string, string> = {
  ARBITRAGE: "#06B6D4",
  ENTRAINEMENT: "#10B981",
  JOUEURS: "#F59E0B",
  ADMINISTRATION: "#8B5CF6",
};

const MONTH_NAMES: Record<string, string> = {
  "01": "Jan",
  "02": "Fév",
  "03": "Mar",
  "04": "Avr",
  "05": "Mai",
  "06": "Juin",
  "07": "Juil",
  "08": "Août",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Déc",
};

const PERIODS = [
  { value: "7", label: "7 jours", shortLabel: "7j" },
  { value: "30", label: "30 jours", shortLabel: "30j" },
  { value: "90", label: "90 jours", shortLabel: "90j" },
  { value: "all", label: "Tout le temps", shortLabel: "Tout" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMonth(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length === 2) {
    return MONTH_NAMES[parts[1]] || monthKey;
  }
  return monthKey;
}

function formatMonthFull(monthKey: string): string {
  const parts = monthKey.split("-");
  if (parts.length === 2) {
    return `${MONTH_NAMES[parts[1]] || monthKey} ${parts[0]}`;
  }
  return monthKey;
}

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid hsl(var(--border))",
  fontSize: "12px",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

// ─── Main Component ──────────────────────────────────────────────────────────────────

export function AdminAnalyticsPage() {
  const { user } = useAppStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState("30");

  const fetchData = useCallback(async (p: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/stats?userId=${user?.id}&role=${user?.role}&period=${p}`
      );
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData(period);
  }, [user, fetchData, period]);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
  };

  const handleExport = () => {
    if (!data) return;

    const rows: string[] = [];

    rows.push("Vue d'ensemble");
    rows.push("Métrique,Valeur");
    rows.push(`Utilisateurs totaux,${data.overview.totalUsers}`);
    rows.push(`Utilisateurs actifs,${data.overview.totalActiveUsers} (${data.overview.activeDays}j)`);
    rows.push(`Cours totaux,${data.overview.totalCourses}`);
    rows.push(`Cours publiés,${data.overview.totalPublishedCourses}`);
    rows.push(`Inscriptions,${data.overview.totalEnrollments}`);
    rows.push(`Inscriptions terminées,${data.overview.completedEnrollments}`);
    rows.push(`Taux de complétion,${data.overview.completionRate}%`);
    rows.push(`Certificats,${data.overview.totalCertificates}`);
    rows.push(`Tentatives de quiz,${data.overview.totalQuizAttempts}`);
    rows.push(`Taux de réussite quiz,${data.overview.quizPassRate}%`);
    rows.push(`Badges,${data.overview.totalBadges}`);
    rows.push(`Messages,${data.overview.totalMessages}`);
    rows.push("");

    rows.push("Utilisateurs par rôle");
    rows.push("Rôle,Nombre");
    for (const r of data.usersByRole) {
      rows.push(`${ROLE_LABELS[r.role] || r.role},${r._count.role}`);
    }
    rows.push("");

    rows.push("Inscriptions par mois");
    rows.push("Mois,Nombre");
    for (const m of data.enrollmentsByMonth) {
      rows.push(`${formatMonthFull(m.month)},${m.count}`);
    }
    rows.push("");

    rows.push("Certificats par mois");
    rows.push("Mois,Nombre");
    for (const m of data.certificatesByMonth) {
      rows.push(`${formatMonthFull(m.month)},${m.count}`);
    }
    rows.push("");

    rows.push("Cours par catégorie");
    rows.push("Catégorie,Nombre");
    for (const c of data.coursesByCategory) {
      rows.push(`${CATEGORY_LABELS[c.category] || c.category},${c._count.category}`);
    }

    const csvContent = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé.",
    });
  };

  if (loading && !data) return <AnalyticsSkeleton />;
  if (error || !data) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytique</h2>
          <p className="text-muted-foreground mt-1">Tableau de bord analytique</p>
        </div>
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
            <p className="text-sm text-muted-foreground">
              Impossible de récupérer les statistiques. Veuillez réessayer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytique</h2>
          <p className="text-muted-foreground mt-1">
            Tableau de bord analytique de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="rounded-lg border-border/60 text-xs"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter + Period Cards */}
      <OverviewSection overview={data.overview} />

      {/* Date Range Filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Calendar className="w-4 h-4 text-muted-foreground mr-1" />
        <span className="text-xs font-medium text-muted-foreground mr-1">Période :</span>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePeriodChange(p.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              period === p.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground border-border/60 hover:border-border"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <ChartsSection data={data} />

      {/* Top Courses Table */}
      <TopCoursesSection />

      {/* Recent Activity */}
      <RecentActivitySection />
    </div>
  );
}

// ─── Overview Section ────────────────────────────────────────────────────────────

function OverviewSection({ overview }: { overview: StatsOverview }) {
  const cards = [
    {
      label: "Utilisateurs",
      value: overview.totalUsers,
      sub: `${overview.totalActiveUsers} actifs (${overview.activeDays}j)`,
      icon: Users,
      color: "bg-sky-500/10 text-sky-600",
      accent: "bg-sky-500",
    },
    {
      label: "Cours",
      value: overview.totalCourses,
      sub: `${overview.totalPublishedCourses} publiés`,
      icon: BookOpen,
      color: "bg-emerald-500/10 text-emerald-600",
      accent: "bg-emerald-500",
    },
    {
      label: "Inscriptions",
      value: overview.totalEnrollments,
      sub: `Taux complétion: ${overview.completionRate}%`,
      icon: GraduationCap,
      color: "bg-violet-500/10 text-violet-600",
      accent: "bg-violet-500",
    },
    {
      label: "Certificats",
      value: overview.totalCertificates,
      sub: "Émis au total",
      icon: Award,
      color: "bg-amber-500/10 text-amber-600",
      accent: "bg-amber-500",
    },
    {
      label: "Quiz réussis",
      value: `${overview.quizPassRate}%`,
      sub: `${overview.totalQuizAttempts} tentatives`,
      icon: Target,
      color: "bg-green-500/10 text-green-600",
      accent: "bg-green-500",
    },
    {
      label: "Messages",
      value: overview.totalMessages,
      sub: "Sur la plateforme",
      icon: MessageSquare,
      color: "bg-rose-500/10 text-rose-600",
      accent: "bg-rose-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="border-border/60 relative overflow-hidden">
            <div className={cn("absolute top-0 left-0 w-full h-0.5", card.accent)} />
            <CardContent className="p-4">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center mb-3",
                  card.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">
                {card.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                {card.label}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {card.sub}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Charts Section ────────────────────────────────────────────────────────────

function ChartsSection({ data }: { data: StatsData }) {
  const {
    overview,
    usersByRole,
    usersByMonth,
    enrollmentsByMonth,
    certificatesByMonth,
    coursesByCategory,
  } = data;

  // Role distribution pie data (donut)
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

  // Quiz pass/fail pie data
  const quizPieData = useMemo(() => {
    const items = [];
    if (overview.passedAttempts > 0) {
      items.push({ name: "Réussis", value: overview.passedAttempts, fill: "#10B981" });
    }
    if (overview.failedAttempts > 0) {
      items.push({ name: "Échoués", value: overview.failedAttempts, fill: "#EF4444" });
    }
    if (items.length === 0) return [{ name: "Aucune tentative", value: 1, fill: "#94a3b8" }];
    return items;
  }, [overview.passedAttempts, overview.failedAttempts]);

  // User registrations line data
  const registrationLineData = useMemo(
    () =>
      usersByMonth.map((m) => ({
        name: formatMonth(m.month),
        month: m.month,
        inscriptions: m.count,
      })),
    [usersByMonth]
  );

  // Enrollments bar data
  const enrollmentBarData = useMemo(
    () =>
      enrollmentsByMonth.map((m) => ({
        name: formatMonth(m.month),
        month: m.month,
        inscriptions: m.count,
      })),
    [enrollmentsByMonth]
  );

  // Certificate line data
  const certificateLineData = useMemo(
    () =>
      certificatesByMonth.map((m) => ({
        name: formatMonth(m.month),
        month: m.month,
        certificats: m.count,
      })),
    [certificatesByMonth]
  );

  // Category bar data
  const categoryBarData = useMemo(
    () =>
      coursesByCategory.map((c) => ({
        name: CATEGORY_LABELS[c.category] || c.category,
        category: c.category,
        cours: c._count.category,
      })),
    [coursesByCategory]
  );

  // Completion radial data
  const completionRadialData = useMemo(
    () => [{ name: "Complétion", value: overview.completionRate, fill: "#10B981" }],
    [overview.completionRate]
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
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="90%"
                    data={completionRadialData}
                    startAngle={180}
                    endAngle={0}
                    barSize={12}
                  >
                    <RadialBar
                      background={{ fill: "#f1f5f9" }}
                      dataKey="value"
                      cornerRadius={6}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-3xl font-bold text-foreground">
                  {overview.completionRate}
                  <span className="text-base font-medium text-muted-foreground">%</span>
                </p>
                <Progress value={overview.completionRate} className="h-2.5" />
                <p className="text-sm text-muted-foreground">
                  {overview.completionRate >= 60
                    ? "Excellent ! Les apprenants terminent leurs parcours."
                    : overview.completionRate >= 30
                      ? "Bonne progression. Continuez à motiver."
                      : "Encouragez les apprenants à terminer."}
                </p>
                <div className="flex gap-6 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    {overview.completedEnrollments} terminés
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-violet-500" />
                    {overview.totalEnrollments} inscriptions
                  </span>
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
                      <Pie
                        data={quizPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {quizPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-3xl font-bold text-foreground">
                        {overview.quizPassRate}
                        <span className="text-base font-medium text-muted-foreground">%</span>
                      </p>
                      <p className="text-xs text-muted-foreground">de réussite</p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            "bg-green-500"
                          )}
                        />
                        <span className="text-xs text-muted-foreground">
                          {overview.passedAttempts} réussi{overview.passedAttempts > 1 ? "s" : ""}
                        </span>
                      </div>
                      {overview.failedAttempts > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span
                            className={cn(
                              "w-2.5 h-2.5 rounded-full",
                              "bg-red-500"
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            {overview.failedAttempts} échec{overview.failedAttempts > 1 ? "s" : ""}
                          </span>
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

      {/* Row 2: User Registrations + Enrollments by Month */}
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, _name, props) => [
                      `${value} inscriptions`,
                      formatMonthFull((props as Record<string, unknown>).payload?.month as string),
                    ]}
                    labelFormatter={() => ""}
                  />
                  <Bar dataKey="inscriptions" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={48} />
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, _name, props) => [
                      `${value} certificats`,
                      formatMonthFull((props as Record<string, unknown>).payload?.month as string),
                    ]}
                    labelFormatter={() => ""}
                  />
                  <Line
                    type="monotone"
                    dataKey="certificats"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ fill: "#F59E0B", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Role Distribution + User Registrations + Courses by Category */}
      <div className="grid lg:grid-cols-3 gap-6">
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
                  <Pie
                    data={rolePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {rolePieData.map((entry) => (
                      <Cell
                        key={entry.role}
                        fill={ROLE_CHART_COLORS[entry.role] || "#6B7280"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${value} (${(props as Record<string, unknown>).payload?.pct}%)`,
                      "Utilisateurs",
                    ]}
                    contentStyle={tooltipStyle}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: "8px" }}
                    formatter={(value: string) => (
                      <span className="text-[10px] text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, _name, props) => [
                      `${value} inscrits`,
                      formatMonthFull((props as Record<string, unknown>).payload?.month as string),
                    ]}
                    labelFormatter={() => ""}
                  />
                  <Line
                    type="monotone"
                    dataKey="inscriptions"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    dot={{ fill: "#06B6D4", r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Cours par catégorie
            </h3>
            {categoryBarData.length === 0 ? (
              <EmptyChartState message="Aucun cours" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={categoryBarData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${value} cours`, "Nombre"]}
                    labelFormatter={() => ""}
                  />
                  <Bar dataKey="cours" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {categoryBarData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={CATEGORY_CHART_COLORS[entry.category] || "#6B7280"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Empty Chart State ───────────────────────────────────────────────────────────────

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] text-muted-foreground/50">
      <div className="text-center">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-xs">{message}</p>
      </div>
    </div>
  );
}

// ─── Top Courses Section ─────────────────────────────────────────────────────

interface TopCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  enrollmentCount: number;
  completionRate: number;
  passRate: number;
}

function TopCoursesSection() {
  const { user } = useAppStore();
  const [courses, setCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `/api/admin/course-stats?userId=${user?.id}&role=${user?.role}`
        );
        if (!res.ok) throw new Error("Erreur");
        const json = await res.json();
        const courseList: TopCourse[] = (json.courses || []).map(
          (c: Record<string, unknown>) => ({
            id: c.id as string,
            title: c.title as string,
            category: (c.category as string) || "ARBITRAGE",
            difficulty: (c.difficulty as string) || "DEBUTANT",
            enrollmentCount: (c.enrollmentCount as number) || 0,
            completionRate: (c.completionRate as number) || 0,
            passRate: (c.passRate as number) || 0,
          })
        );
        setCourses(courseList);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-primary" /> Cours les plus suivis
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun cours disponible</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2.5 px-3 font-medium">#</th>
                  <th className="text-left py-2.5 px-3 font-medium">Cours</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell">
                    Catégorie
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium text-right">
                    Inscriptions
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium text-right hidden md:table-cell">
                    Complétion
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium text-right hidden lg:table-cell">
                    Réussite
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr
                    key={course.id}
                    className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold",
                          i < 3
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {course.title}
                      </p>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          CATEGORY_LABELS[course.category] || "bg-gray-100 text-gray-700"
                        )}
                      >
                        {CATEGORY_LABELS[course.category] || course.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-sm font-semibold text-foreground">
                        {course.enrollmentCount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          value={course.completionRate}
                          className="w-16 h-1.5"
                        />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {course.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right hidden lg:table-cell">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          course.passRate >= 70
                            ? "text-green-600"
                            : course.passRate >= 50
                              ? "text-amber-600"
                              : "text-red-600"
                        )}
                      >
                        {course.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Activity Section ─────────────────────────────────────────────────────────

interface RecentEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  status: string;
  createdAt: string;
}

interface RecentQuiz {
  id: string;
  userName: string;
  quizTitle: string;
  score: number;
  status: string;
  submittedAt: string | null;
}

interface RecentCert {
  id: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
}

function RecentActivitySection() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState("enrollments");
  const [enrollments, setEnrollments] = useState<RecentEnrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<RecentQuiz[]>([]);
  const [certificates, setCertificates] = useState<RecentCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, quizRes, certRes] = await Promise.all([
          fetch(
            `/api/admin/enrollments?limit=20&userId=${user?.id}&role=${user?.role}`
          ).catch(() => null),
          fetch(
            `/api/admin/quiz-attempts?limit=20&userId=${user?.id}&role=${user?.role}`
          ).catch(() => null),
          fetch(
            `/api/admin/certificates?limit=20&userId=${user?.id}&role=${user?.role}`
          ).catch(() => null),
        ]);

        if (enrollRes?.ok) {
          const enrollData = await enrollRes.json();
          setEnrollments(
            (enrollData.enrollments || []).slice(0, 20).map(
              (e: Record<string, unknown>) => ({
                id: e.id as string,
                userName: e.userName as string,
                userEmail: e.userEmail as string,
                courseTitle: (e.courseTitle as string) || "Cours",
                status: (e.status as string) || "en_cours",
                createdAt: e.createdAt as string,
              })
            )
          );
        }

        if (quizRes?.ok) {
          const quizData = await quizRes.json();
          setQuizAttempts(
            (quizData.attempts || []).slice(0, 20).map(
              (a: Record<string, unknown>) => ({
                id: a.id as string,
                userName: a.userName as string,
                quizTitle: a.quizTitle as string,
                score: a.score as number,
                status: a.status as string,
                submittedAt: a.submittedAt as string | null,
              })
            )
          );
        }

        if (certRes?.ok) {
          const certData = await certRes.json();
          setCertificates(
            (certData.certificates || certData || []).slice(0, 20).map(
              (c: Record<string, unknown>) => ({
                id: c.id as string,
                userName: (c.userName as string) || "Utilisateur",
                courseTitle: (c.courseTitle as string) || "Cours",
                issuedAt: c.issuedAt as string,
              })
            )
          );
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activité récente
        </h3>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="enrollments" className="text-xs">
              <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
              Inscriptions
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs">
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="certificates" className="text-xs">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Certificats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <EmptyActivityState message="Aucune inscription récente" />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {enrollments.map((item) => (
                  <ActivityRow
                    key={item.id}
                    icon={<GraduationCap className="w-4 h-4 text-sky-500" />}
                    title={item.userName}
                    subtitle={item.courseTitle}
                    time={item.createdAt}
                    badge={{
                      label:
                        item.status === "termine"
                          ? "Terminé"
                          : item.status === "abandonne"
                            ? "Abandonné"
                            : "En cours",
                      className:
                        item.status === "termine"
                          ? "bg-green-100 text-green-700"
                          : item.status === "abandonne"
                            ? "bg-red-100 text-red-700"
                            : "bg-sky-100 text-sky-700",
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : quizAttempts.length === 0 ? (
              <EmptyActivityState message="Aucune tentative de quiz récente" />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {quizAttempts.map((item) => (
                  <ActivityRow
                    key={item.id}
                    icon={
                      item.status === "REUSSI" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : item.status === "ECHOUE" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )
                    }
                    title={item.userName}
                    subtitle={item.quizTitle}
                    time={item.submittedAt}
                    badge={{
                      label:
                        item.status === "REUSSI"
                          ? `${item.score}% ✓`
                          : item.status === "ECHOUE"
                            ? `${item.score}% ✗`
                            : `${item.score}%`,
                      className:
                        item.status === "REUSSI"
                          ? "bg-green-100 text-green-700"
                          : item.status === "ECHOUE"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700",
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="certificates">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : certificates.length === 0 ? (
              <EmptyActivityState message="Aucun certificat récent" />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {certificates.map((item) => (
                  <ActivityRow
                    key={item.id}
                    icon={<Award className="w-4 h-4 text-amber-500" />}
                    title={item.userName}
                    subtitle={item.courseTitle}
                    time={item.issuedAt}
                    badge={{
                      label: "Certifié",
                      className: "bg-amber-100 text-amber-700",
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Activity Row ────────────────────────────────────────────────────────────

function ActivityRow({
  icon,
  title,
  subtitle,
  time,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string | null;
  badge: { label: string; className: string } | null;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <Badge variant="secondary" className={cn("text-[10px]", badge.className)}>
            {badge.label}
          </Badge>
        )}
        <span className="text-[10px] text-muted-foreground hidden sm:block">
          {time ? new Date(time).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
        </span>
      </div>
    </div>
  );
}

// ─── Empty Activity State ────────────────────────────────────────────────────────────

function EmptyActivityState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─── Analytics Skeleton ────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <Skeleton className="h-9 w-9 rounded-lg mb-3" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-44 mb-4" />
            <div className="flex items-center gap-8">
              <Skeleton className="w-36 h-36 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-2.5 w-full max-w-sm" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <Skeleton className="h-5 w-44 mb-4" />
            <Skeleton className="w-full h-[260px] rounded-lg" />
          </CardContent>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-6">
              <Skeleton className="h-5 w-40 mb-4" />
              <Skeleton className="w-full h-[240px] rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Top courses table */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <Skeleton className="h-5 w-44 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Activity */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <Skeleton className="h-5 w-44 mb-4" />
          <Skeleton className="h-9 w-72 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
