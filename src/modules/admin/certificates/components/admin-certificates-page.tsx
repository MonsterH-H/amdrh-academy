"use client";

import { Award, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificatesTab } from "./certificate-list";
import { BadgesTab } from "./badges-tab";

// ─── Admin Certificates Page ───────────────────────────────────────

export function AdminCertificatesPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Certificats & Badges</h2>
        <p className="text-muted-foreground mt-1">Gérez les certificats et badges de la plateforme</p>
      </div>
      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList className="bg-white border border-border/60 rounded-lg p-1">
          <TabsTrigger value="certificates" className="rounded-md gap-1.5 text-sm">
            <Award className="w-4 h-4" />
            Certificats
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-md gap-1.5 text-sm">
            <Star className="w-4 h-4" />
            Badges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="badges">
          <BadgesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
