"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Clock, Trophy, PieChart as PieChartIcon } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import type { CourseData, CourseProgressDetail, QuizAttemptData } from "../../types";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

export function AnalyticsCharts({
  courses,
  progressMap,
  quizAttempts,
}: {
  courses: CourseData[];
  progressMap: Record<string, CourseProgressDetail>;
  quizAttempts: QuizAttemptData[];
}) {
  const courseProgressData = courses.slice(0, 8).map((c) => {
    const enrollment = c.enrollments[0];
    return { name: c.title.length > 20 ? c.title.substring(0, 18) + "…" : c.title, progression: enrollment?.progress || 0 };
  });

  const categoryMap = new Map<string, number>();
  for (const c of courses) {
    const cat = CATEGORY_LABELS[c.category] || c.category;
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  const quizScoreData = [...quizAttempts]
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .slice(0, 10)
    .map((a, idx) => ({
      name: `T${idx + 1}`,
      score: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0,
    }));

  const timeData = courses.slice(0, 6).map((c) => {
    const detail = progressMap[c.id];
    return { name: c.title.length > 15 ? c.title.substring(0, 13) + "…" : c.title, minutes: Math.round((detail?.totalTimeSpent || 0) / 60) };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" /> Statistiques
      </h2>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="progress" className="text-xs gap-1"><TrendingUp className="w-3 h-3" /> Progression</TabsTrigger>
          <TabsTrigger value="time" className="text-xs gap-1"><Clock className="w-3 h-3" /> Temps</TabsTrigger>
          <TabsTrigger value="quizzes" className="text-xs gap-1"><Trophy className="w-3 h-3" /> Quiz</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1"><PieChartIcon className="w-3 h-3" /> Catégories</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">Progression par cours</p>
              {courseProgressData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={courseProgressData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Progression"]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="progression" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée disponible</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">Temps passé par cours (minutes)</p>
              {timeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [`${value} min`, "Temps passé"]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="minutes" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée disponible</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">Scores des quiz (%)</p>
              {quizScoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={quizScoreData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Aucune tentative de quiz</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="border-border/60">
            <CardContent className="p-4 sm:p-6">
              <p className="text-sm font-medium text-foreground mb-4">Répartition par catégorie</p>
              {categoryData.length > 0 ? (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e5e7eb" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée disponible</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
