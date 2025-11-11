"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Layout } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateSelectionModal } from "@/components/template-selection-modal";
import api from "@/lib/api/api";
import { toast } from "sonner";

interface Notebook {
  id: string;
  name: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

interface NewNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewNoteModal({ open, onOpenChange }: NewNoteModalProps) {
  const router = useRouter();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [quickCaptureId, setQuickCaptureId] = useState<string | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(false);

  useEffect(() => {
    const fetchQuickCaptureId = async () => {
      if (open && !quickCaptureId) {
        setIsLoadingId(true);
        try {
          const response = await api.get<Notebook[]>("/notebooks/");
          const qcNotebook = response.data.find(
            (nb) => nb.name === "Capturas Rápidas"
          );
          if (qcNotebook) {
            setQuickCaptureId(qcNotebook.id);
          } else {
            toast.error(
              "Não foi possível encontrar o caderno 'Capturas Rápidas'."
            );
          }
        } catch (err) {
          console.error("Erro ao buscar cadernos:", err);
          toast.error("Erro ao carregar dados do caderno.");
        } finally {
          setIsLoadingId(false);
        }
      }
    };
    fetchQuickCaptureId();
  }, [open, quickCaptureId]);

  const handleCreateFromScratch = () => {
    onOpenChange(false);
    window.location.href = "/notes?new=true"
  };

  const handleCreateFromTemplate = () => {
    onOpenChange(false);
    setShowTemplateModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Criar uma nova nota
            </DialogTitle>
            <DialogDescription className="text-center">
              Escolha como você gostaria de criar sua nova nota
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              onClick={handleCreateFromScratch}
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-primary/5 hover:border-primary bg-transparent"
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Criar nota do zero</div>
              </div>
            </Button>

            <Button
              onClick={handleCreateFromTemplate}
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-primary/5 hover:border-primary bg-transparent"
              disabled={isLoadingId || !quickCaptureId} // Desabilita enquanto busca o ID
            >
              <Layout className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Criar a partir de template</div>
                {isLoadingId && (
                  <p className="text-xs text-muted-foreground">Carregando...</p>
                )}
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Passa o ID do caderno para o modal de seleção */}
      {quickCaptureId && (
        <TemplateSelectionModal
          open={showTemplateModal}
          onOpenChange={setShowTemplateModal}
          targetNotebookId={quickCaptureId}
        />
      )}
    </>
  );
}
