"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare, Search, Plus, ArrowLeft, Send,
  MessageCircle, Pin, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";
import { useAppStore } from "@/store/app";
import { formatTimeAgo } from "@/utils/format";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForumAuthor {
  id: string;
  prenom: string;
  nom: string;
  avatar: string | null;
}

interface ForumReply {
  id: string;
  content: string;
  author: ForumAuthor;
  createdAt: string;
}

interface ForumDiscussion {
  id: string;
  title: string;
  content: string;
  author: ForumAuthor;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isResolved: boolean;
}

// ─── Forum Tab ────────────────────────────────────────────────────────────────

export function ForumTab({ courseId }: { courseId: string }) {
  const { user } = useAppStore();
  const [discussions, setDiscussions] = useState<ForumDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<ForumDiscussion | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    try {
      const params: Record<string, string> = { courseId: "", limit: "50" };
      if (search) params.search = search;
      const data = await apiFetch<{ discussions: ForumDiscussion[] }>(
        `/api/forum/${courseId}`,
        { params },
      );
      setDiscussions(data.discussions || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les discussions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [courseId, search]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Champs requis", description: "Titre et contenu sont obligatoires.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/forum/${courseId}`, {
        method: "POST",
        body: { userId: user?.id, title: newTitle.trim(), content: newContent.trim() },
      });
      toast({ title: "Discussion créée", description: "Votre discussion a été publiée." });
      setNewTitle("");
      setNewContent("");
      setShowNewForm(false);
      fetchDiscussions();
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer la discussion.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Discussion detail view
  if (selectedDiscussion) {
    return (
      <DiscussionDetail
        courseId={courseId}
        discussion={selectedDiscussion}
        userId={user?.id}
        onBack={() => setSelectedDiscussion(null)}
      />
    );
  }

  // New discussion form
  if (showNewForm) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Nouvelle discussion</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
              Annuler
            </Button>
          </div>
          <Input
            placeholder="Titre de la discussion"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="max-w-lg"
          />
          <Textarea
            placeholder="Décrivez votre question ou votre sujet..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={5}
          />
          <Button onClick={handleCreateDiscussion} disabled={submitting} className="gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Publication..." : "Publier"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Rechercher une discussion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowNewForm(true)}>
          <Plus className="w-3.5 h-3.5" />
          Nouvelle discussion
        </Button>
      </div>

      {/* Discussion list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : discussions.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {search ? "Aucun résultat" : "Aucune discussion"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Essayez un autre terme de recherche."
                : "Soyez le premier à lancer une discussion !"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {discussions.map((discussion) => (
            <DiscussionListItem
              key={discussion.id}
              discussion={discussion}
              onClick={() => setSelectedDiscussion(discussion)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Discussion List Item ─────────────────────────────────────────────────────

function DiscussionListItem({
  discussion,
  onClick,
}: {
  discussion: ForumDiscussion;
  onClick: () => void;
}) {
  return (
    <Card
      className="border-border/60 hover:border-primary/20 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="text-[11px] bg-primary/10 text-primary">
              {discussion.author.prenom.charAt(0)}{discussion.author.nom.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {discussion.title}
              </h4>
              {discussion.isPinned && (
                <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />
              )}
              {discussion.isResolved && (
                <Badge className="bg-blue-100 text-blue-700 text-[9px]">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                  Résolu
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
              {discussion.content}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="font-medium">
                {discussion.author.prenom} {discussion.author.nom}
              </span>
              <span>{formatTimeAgo(discussion.createdAt)}</span>
              {discussion.replyCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="w-3 h-3" />
                  {discussion.replyCount} réponse{discussion.replyCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Discussion Detail ────────────────────────────────────────────────────────

function DiscussionDetail({
  courseId,
  discussion: initialDiscussion,
  userId,
  onBack,
}: {
  courseId: string;
  discussion: ForumDiscussion;
  userId?: string;
  onBack: () => void;
}) {
  const [discussion, setDiscussion] = useState(initialDiscussion);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await apiFetch<{ replies: ForumReply[] }>(
          `/api/forum/${courseId}/${discussion.id}`,
        );
        setReplies(data.replies || []);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger les réponses.", variant: "destructive" });
      } finally {
        setLoadingReplies(false);
      }
    };
    fetchDetail();
  }, [courseId, discussion.id]);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      const data = await apiFetch<ForumReply>(`/api/forum/${courseId}/${discussion.id}`, {
        method: "POST",
        body: { userId, content: replyContent.trim() },
      });
      setReplies((prev) => [...prev, data]);
      setReplyContent("");
      toast({ title: "Réponse publiée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de publier la réponse.", variant: "destructive" });
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBack}>
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour aux discussions
      </Button>

      {/* Discussion content */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {discussion.author.prenom.charAt(0)}{discussion.author.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold text-foreground">{discussion.title}</h3>
                {discussion.isResolved && (
                  <Badge className="bg-blue-100 text-blue-700 text-[9px]">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                    Résolu
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span className="font-medium">
                  {discussion.author.prenom} {discussion.author.nom}
                </span>
                <span>{formatTimeAgo(discussion.createdAt)}</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          {replies.length} réponse{replies.length !== 1 ? "s" : ""}
        </h4>

        {loadingReplies ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : (
          <>
            {replies.map((reply) => (
              <Card key={reply.id} className="border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-[10px] bg-muted">
                        {reply.author.prenom.charAt(0)}{reply.author.nom.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <span className="font-medium">
                          {reply.author.prenom} {reply.author.nom}
                        </span>
                        <span>{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Reply form */}
            <Card className="border-primary/20">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Écrire une réponse..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={submittingReply || !replyContent.trim()}
                    className="gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingReply ? "Envoi..." : "Répondre"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
