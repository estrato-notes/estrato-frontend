"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, BookOpen, Zap, Hash, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api/api";
import { toast } from "sonner";

interface NoteResponse {
  id: string;
  title: string;
  content: string | null;
  is_favorite: boolean;
  notebook_id: string;
  created_at: string;
  updated_at: string | null;
}

interface TemplateResponse {
  id: string;
  name: string;
  content: string | null;
  created_at: string;
}

interface TagPopularResponse {
  id: string;
  name: string;
  note_count: number;
}

interface NotebookResponse {
  id: string;
  name: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

interface DashboardData {
  recent_notes: NoteResponse[];
  popular_tags: TagPopularResponse[];
  favorite_notes: NoteResponse[];
  recent_templates: TemplateResponse[];
  favorite_notebooks: NotebookResponse[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [quickNote, setQuickNote] = useState("");

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagColors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "bg-green-100 text-green-700 hover:bg-green-200",
    "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "bg-orange-100 text-orange-700 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 hover:bg-pink-200",
    "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<DashboardData>("/dashboard/");
        setData(response.data);
      } catch (err: any) {
        console.error(err);

        if (err.response && err.response.status === 401) {
          setError("Sua sessão expirou. Faça login novamente.");
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError("Não foi possível carregar os dados do dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleSaveQuickNote = async () => {
    if (!quickNote.trim()) return;

    const toastId = toast.loading("Salvando nota rápida...");

    try {
      const response = await api.post("/notes/quick-capture", {
        content: quickNote,
      });

      const newNote = response.data;

      setQuickNote("");

      setData((prevData) => {
        if (!prevData) return null;

        const updatedRecentNotes = [newNote, ...prevData.recent_notes];

        return {
          ...prevData,
          recent_notes: updatedRecentNotes,
        };
      });

      toast.success("Nota rápida salva!", {
        id: toastId,
        description: newNote.title,
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar a nota", {
        id: toastId,
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes?note=${noteId}`);
  };

  const handleTagClick = (tagName: string) => {
    router.push(`/tags?tag=${tagName}`);
  };

  const handleTemplateClick = (templateId: string) => {
    router.push(`/templates?template=${templateId}`);
  };

  const handleFavoriteClick = (
    item: NoteResponse | NotebookResponse,
    type: "note" | "notebook"
  ) => {
    if (type === "note") {
      router.push(`/notes?note=${item.id}`);
    } else if (type === "notebook") {
      router.push(`/notes?notebook=${item.id}`);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-24 w-1/2" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Erro ao carregar
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Voltar para o Login
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            Bem-Vind@
            <br />
            de volta!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organize suas ideias e mantenha-se produtivo
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Capture - Full Width on Mobile, Spans 2 Columns on Desktop */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Zap className="h-5 w-5 text-primary" />
                Captura Rápida
              </CardTitle>
              <CardDescription className="text-sm">
                Anote rapidamente suas ideias antes que elas escapem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Digite sua nota rápida aqui..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="min-h-[120px] resize-none text-sm sm:text-base"
              />
              <Button
                onClick={handleSaveQuickNote}
                className="w-full sm:w-auto"
              >
                Salvar
              </Button>
            </CardContent>
          </Card>

          {/* Tags Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Hash className="h-5 w-5 text-primary" />
                Tags Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.popular_tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma tag encontrada.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.popular_tags.map((tag, index) => (
                    <Badge
                      key={tag.id}
                      onClick={() => handleTagClick(tag.name)}
                      className={`cursor-pointer transition-colors text-xs sm:text-sm ${
                        tagColors[index % tagColors.length]
                      }`}
                    >
                      {tag.name} ({tag.note_count})
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Notas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recent_notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma nota recente.
                </p>
              ) : (
                <div className="space-y-3">
                  {data?.recent_notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleNoteClick(note.id)}
                      className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {note.title}
                        </h3>
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {note.content || "Nenhum conteúdo"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Atualizado em:{" "}
                        {new Date(
                          note.updated_at || note.created_at
                        ).toLocaleString("pt-Br")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recent_templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum template criado.
                </p>
              ) : (
                <div className="space-y-3">
                  {data?.recent_templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateClick(template.id)}
                      className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <h3 className="font-semibold text-sm mb-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {template.content || "Nenhum Conteúdo"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favoritos */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Star className="h-5 w-5 text-[#F6A800] fill-[#F6A800]" />
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.favorite_notes.length === 0 &&
              data.favorite_notebooks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum item favoritado.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Notas Favoritas */}
                  {data?.favorite_notes.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleFavoriteClick(item, "note")}
                      className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {item.title}
                        </h3>
                        <Star className="h-4 w-4 text-[#F6A800] fill-[#F6A800] shrink-0 ml-2" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.content || "Nenhum conteúdo"}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        Nota
                      </div>
                    </div>
                  ))}
                  {/* Cadernos Favoritos */}
                  {data?.favorite_notebooks.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleFavoriteClick(item, "notebook")}
                      className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {item.name}
                        </h3>
                        <Star className="h-4 w-4 text-[#F6A800] fill-[#F6A800] shrink-0 ml-2" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        Caderno
                        {/* Você pode adicionar contagem de notas aqui se o backend retornar */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
