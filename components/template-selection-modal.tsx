"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import api from "@/lib/api/api";

interface Template {
  id: string;
  name: string;
  content: string | null;
  created_at: string;
}

interface NoteResponse {
  id: string;
  title: string;
  content: string | null;
  is_favorite: boolean;
  notebook_id: string;
  created_at: string;
  updated_at: string | null;
}

interface TemplateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetNotebookId: string;
}

export function TemplateSelectionModal({
  open,
  onOpenChange,
  targetNotebookId,
}: TemplateSelectionModalProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const response = await api.get<Template[]>("/templates/");
          setTemplates(response.data);
        } catch (err) {
          console.error("Erro ao buscar templates:", err);
          toast.error("Erro ao carregar templates.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTemplates();
  }, [open]);
  
  const handleSelectTemplate = async (template: Template) => {
    if (isCreating || !targetNotebookId) return;

    setIsCreating(true);
    const toastId = toast.loading("Criando nota a partir do template...");

    try {
      const response = await api.post<NoteResponse>(
        `/notebooks/${targetNotebookId}/notes/from-template/${template.id}`,
        {
          title: template.name,
        }
      );

      const newNote = response.data;
      toast.success("Nota criada com sucesso!", { id: toastId });
      onOpenChange(false);

      window.location.href = `/notes?note=${newNote.id}&notebook=${newNote.notebook_id}`;
    } catch (err) {
      console.error("Erro ao criar nota do template:", err);
      toast.error("Erro ao criar nota. Tente novamente.", { id: toastId });
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Escolher Template</DialogTitle>
          <DialogDescription>
            Selecione um template para criar sua nova nota
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {isLoading ? (
              // Esqueletos de loading
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : templates.length === 0 ? (
              // Mensagem de "nenhum template"
              <p className="text-muted-foreground text-sm text-center col-span-2">
                Nenhum template encontrado. Você pode criar um na página de
                notas ou em "Gerenciar Templates".
              </p>
            ) : (
              // Lista de templates
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  disabled={isCreating}
                  className="p-4 border rounded-lg text-left hover:bg-accent hover:border-primary transition-colors disabled:opacity-50"
                >
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content || "Template sem descrição"}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
