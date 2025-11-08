"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import api from "@/lib/api/api";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

interface Tag {
  id: string;
  name: string;
}

export default function TagsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newTagName, setNewTagName] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tagColors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700",
  ];

  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get<Tag[]>("/tags/");
        setTags(response.data);
      } catch (err: any) {
        console.error("Erro ao buscar tags:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("Não foi possível carregar suas tags. Tente novamente.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [router]);

  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam && tags.length > 0) {
      const tag = tags.find((t) => t.name === tagParam || t.id === tagParam);
      if (tag) {
        setSelectedTag(tag);
        setEditTagName(tag.name);
        setTimeout(() => {
          const element = document.getElementById(`tag-${tag.id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.classList.add("ring-2", "ring-primary", "transition-all");
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-primary");
            }, 2000);
          }
        }, 100);
      }
    }
  }, [searchParams, tags]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    const toastId = toast.loading("Criando tag...");

    try {
      const response = await api.post<Tag>("/tags/", {
        name: newTagName.trim(),
      });
      setTags([...tags, response.data]);
      setNewTagName("");
      toast.success("Tag criada com sucesso!", { id: toastId });
    } catch (err: any) {
      console.error("Erro ao criar tag:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro ao criar tag", {
          description: "Uma tag com esse nome já existe.",
          id: toastId,
        });
      } else {
        toast.error("Erro ao criar tag", {
          description: "Tente novamente mais tarde.",
          id: toastId,
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTag = async () => {
    if (!selectedTag || !editTagName.trim() || isEditing) return;
    setIsEditing(true);
    const toastId = toast.loading("Atualizando tag...");

    try {
      const response = await api.patch<Tag>(`/tags/${selectedTag.id}`, {
        name: editTagName.trim(),
      });
      setTags(tags.map((t) => (t.id === selectedTag.id ? response.data : t)));
      toast.success("Tag atualizada com sucesso!", { id: toastId });
      setShowEditDialog(false);
      setSelectedTag(null);
      setEditTagName("");
    } catch (err: any) {
      console.error("Erro ao editar tag:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro ao atualizar", {
          description: "Uma tag com esse nome já existe.",
          id: toastId,
        });
      } else {
        toast.error("Erro ao atualizar", {
          description: "Tente novamente mais tarde.",
          id: toastId,
        });
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag || isDeleting) return;
    setIsDeleting(true);
    const toastId = toast.loading("Apagando tag...");

    try {
      await api.delete(`/tags/${selectedTag.id}`);
      setTags(tags.filter((t) => t.id !== selectedTag.id));
      toast.success("Tag apagada com sucesso!", { id: toastId });
      setShowDeleteDialog(false);
      setSelectedTag(null);
    } catch (err: any) {
      console.error("Erro ao apagar tag:", err);
      toast.error("Erro ao apagar tag", {
        description: "Tente novamente mais tarde.",
        id: toastId,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="text-center py-10">
          <p className="text-destructive">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Back to Dashboard */}
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Gerenciar Tags
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Crie, edite e organize suas tags
          </p>
        </div>

        {/* Create New Tag Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Criar Nova Tag
            </CardTitle>
            <CardDescription className="text-sm">
              Adicione uma nova tag para organizar suas notas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-tag" className="text-sm">
                  Nome da Tag:
                </Label>
                <Input
                  id="new-tag"
                  placeholder="Ex.: projetos"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                  className="text-sm"
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || isCreating}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  {isCreating ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isCreating ? "Criando..." : "Criar Tag"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags List Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Suas Tags</CardTitle>
            <CardDescription className="text-sm">
              Gerencie todas as suas tags existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <div
                    key={tag.id}
                    id={`tag-${tag.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border hover:bg-accent transition-all gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${getTagColor(index)} text-xs sm:text-sm`}
                      >
                        {tag.name}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tag);
                          setEditTagName(tag.name);
                          setShowEditDialog(true);
                        }}
                        className="text-xs sm:text-sm"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tag);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive hover:text-destructive text-xs sm:text-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Apagar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm sm:text-base">
                    Nenhuma tag criada ainda
                  </p>
                  <p className="text-xs sm:text-sm">
                    Crie sua primeira tag acima
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Tag Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTag(null);
            setEditTagName("");
          }
          setShowEditDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
            <DialogDescription>Altere o nome da tag</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag">Nome da Tag:</Label>
              <Input
                id="edit-tag"
                placeholder="Ex.: projetos"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditTag()}
                disabled={isEditing}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isEditing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditTag}
              disabled={
                !editTagName.trim() ||
                isEditing ||
                editTagName === selectedTag?.name
              }
            >
              {isEditing ? <Spinner className="mr-2" /> : null}
              {isEditing ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTag(null);
          }
          setShowDeleteDialog(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar a tag "{selectedTag?.name}"? Esta
              tag será removida de todas as notas. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="mr-2" /> : null}
              {isDeleting ? "Apagando..." : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
