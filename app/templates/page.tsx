"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Code,
  Eye,
  Pencil,
} from "lucide-react";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Template {
  id: string;
  name: string;
  content: string | null;
  created_at: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState<"edit" | "view">("edit");

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<Template[]>("/templates/");
        setTemplates(response.data);
        if (response.data.length > 0) {
          setSelectedTemplate(response.data[0].id);
        } else {
          handleNewTemplate();
        }
      } catch (err: any) {
        console.error("Erro ao buscar templates: ", err);
        if (err.response && err.response.status === 401) {
          router.push("/login");
        } else {
          setError("Não foi possível carregar seus templates.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, [router]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setTemplateTitle(template.name);
        setTemplateContent(template.content || "");
        setIsEditing(false);
        setActiveTab("edit");
      }
    } else {
      setIsEditing(true);
      setTemplateTitle("");
      setTemplateContent("");
      setActiveTab("edit");
    }
  }, [selectedTemplate, templates]);

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setIsEditing(true);
    setTemplateTitle("");
    setTemplateContent("");
    setActiveTab("edit");
  };

  const handleSave = async () => {
    if (!templateTitle.trim()) {
      toast.error("O título do template não pode ficar vazio.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(
      selectedTemplate ? "Atualizando template..." : "Criando template..."
    );

    try {
      const payload = {
        name: templateTitle,
        content: templateContent,
      };

      if (selectedTemplate) {
        const response = await api.patch<Template>(
          `/templates/${selectedTemplate}`,
          payload
        );
        setTemplates(
          templates.map((t) => (t.id === selectedTemplate ? response.data : t))
        );
        toast.success("Template atualizado!", { id: toastId });
      } else {
        const response = await api.post<Template>("/templates/", payload);
        const newTemplate = response.data;
        setTemplates([newTemplate, ...templates]);
        setSelectedTemplate(newTemplate.id);
        toast.success("Template criado!", { id: toastId });
      }
      setIsEditing(false);
      setActiveTab("view");
    } catch (err: any) {
      console.error("Erro ao salvar template:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro ao salvar", {
          description: "Um template com esse nome já existe.",
          id: toastId,
        });
      } else {
        toast.error("Erro ao salvar template.", { id: toastId });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveTab("view");
    
    if (selectedTemplate === null && templates.length > 0) {
      setSelectedTemplate(templates[0].id);
    } else if (selectedTemplate) {
      const template = templates.find((t) => t.id === selectedTemplate);
      if (template) {
        setTemplateTitle(template.name);
        setTemplateContent(template.content || "");
      }
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setDeleteTemplateId(templateId);
  };

  const confirmDeleteTemplate = async () => {
    if (!deleteTemplateId) return;

    setIsDeleting(true);
    const toastId = toast.loading("Apagando template...");

    try {
      await api.delete(`/templates/${deleteTemplateId}`);

      const newTemplates = templates.filter((t) => t.id !== deleteTemplateId);
      setTemplates(newTemplates);

      toast.success("Template apagado.", { id: toastId });

      if (selectedTemplate === deleteTemplateId) {
        const newSelectedId =
          newTemplates.length > 0 ? newTemplates[0].id : null;
        setSelectedTemplate(newSelectedId);
        if (newSelectedId === null) {
          handleNewTemplate();
        }
      }
    } catch (err) {
      console.error("Erro ao apagar template:", err);
      toast.error("Erro ao apagar template.", { id: toastId });
    } finally {
      setIsDeleting(false);
      setDeleteTemplateId(null);
    }
  };

  // Aplica formatação markdown ao textarea
  const applyFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = templateContent.substring(start, end);

    let prefix = "";
    let suffix = "";
    let placeholder = "";

    switch (format) {
      case "h1":
        prefix = "# ";
        placeholder = "Cabeçalho 1";
        break;
      case "h2":
        prefix = "## ";
        placeholder = "Cabeçalho 2";
        break;
      case "h3":
        prefix = "### ";
        placeholder = "Cabeçalho 3";
        break;
      case "bold":
        prefix = "**";
        suffix = "**";
        placeholder = "negrito";
        break;
      case "italic":
        prefix = "*";
        suffix = "*";
        placeholder = "itálico";
        break;
      case "underline":
        prefix = "<u>";
        suffix = "</u>";
        placeholder = "sublinhado";
        break;
      case "code":
        prefix = "`";
        suffix = "`";
        placeholder = "código";
        break;
      default:
        return;
    }

    const textToInsert = selectedText || placeholder;
    const markdown = prefix + textToInsert + suffix;
    const newContent =
      templateContent.substring(0, start) +
      markdown +
      templateContent.substring(end);

    setTemplateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + placeholder.length
        );
      } else {
        const newCursorPos = start + markdown.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "edit" | "view");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setActiveTab("edit");
  };

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
        {/* Back to Notes */}
        <div className="mb-4">
          <Link href="/notes">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Notas
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Meus Templates
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Column 1: Templates List */}
          <div className="bg-card rounded-lg border overflow-hidden flex flex-col max-h-[400px] lg:max-h-none">
            <div className="p-3 sm:p-4 border-b">
              <Button
                onClick={handleNewTemplate}
                className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                ) : error ? (
                  <p className="text-destructive text-center p-4">{error}</p>
                ) : templates.length === 0 && !isEditing ? (
                  <p className="text-muted-foreground text-center p-4">
                    Nenhum template criado.
                  </p>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-2 sm:p-3 rounded-lg transition-colors ${
                        selectedTemplate === template.id
                          ? "bg-primary/10 border-primary border"
                          : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template.id);
                          }}
                          className="flex-1 text-left"
                        >
                          <h3 className="font-semibold text-xs sm:text-sm mb-1">
                            {template.name}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            Criado em:{" "}
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive hover:text-destructive/80 ml-2"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Template Editor/Viewer */}
          <div className="bg-card rounded-lg border overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Spinner />
              </div>
            ) : selectedTemplate !== null || isEditing ? (
              <Tabs
                defaultValue="edit"
                value={activeTab} 
                onValueChange={handleTabChange}
                className="flex flex-col flex-1 overflow-hidden"
              >
                {/* Cabeçalho com Título e Barra de Ferramentas */}
                <div className="p-3 sm:p-4 border-b space-y-3 sm:space-y-4">
                  <Input
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    disabled={!isEditing}
                    className="text-base sm:text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                    placeholder="Título do Template"
                  />

                  <div className="flex items-center justify-between pt-2 border-t">
                    <TabsList className="h-9">
                      <TabsTrigger
                        value="edit"
                        className="h-7 text-xs sm:text-sm"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </TabsTrigger>
                      <TabsTrigger
                        value="view"
                        className="h-7 text-xs sm:text-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="m-0 p-0 min-w-0">
                      {isEditing && (
                        <div className="flex items-center gap-1 overflow-x-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("h1")}
                            className="h-8 px-2 text-xs"
                          >
                            H1
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("h2")}
                            className="h-8 px-2 text-xs"
                          >
                            H2
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("h3")}
                            className="h-8 px-2 text-xs"
                          >
                            H3
                          </Button>
                          <div className="w-px h-6 bg-border mx-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("bold")}
                            className="h-8 px-2"
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("italic")}
                            className="h-8 px-2"
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("underline")}
                            className="h-8 px-2"
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => applyFormatting("code")}
                            className="h-8 px-2"
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="view" className="m-0 p-0"></TabsContent>
                  </div>
                </div>

                {/* Conteúdo (Editar) */}
                <TabsContent
                  value="edit"
                  className="flex-1 overflow-y-auto min-h-0 focus-visible:ring-0 focus-visible:outline-none"
                >
                  <div className="p-3 sm:p-4 h-full">
                    <Textarea
                      ref={textareaRef}
                      value={templateContent}
                      onChange={(e) => setTemplateContent(e.target.value)}
                      disabled={!isEditing}
                      className="h-full min-h-[300px] sm:min-h-full border-0 focus-visible:ring-0 resize-none font-mono text-xs sm:text-sm p-0"
                      placeholder="Digite o conteúdo do template..."
                    />
                  </div>
                </TabsContent>

                {/* Conteúdo (Visualizar) */}
                <TabsContent
                  value="view"
                  className="flex-1 overflow-y-auto min-h-0 focus-visible:ring-0 focus-visible:outline-none"
                >
                  <div className="p-3 sm:p-4">
                    {templateContent.trim() ? (
                      <div className="markdown-preview">
                        <ReactMarkdown>{templateContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center italic">
                        Nada para visualizar.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Rodapé com Botões */}
                <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 mt-auto">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                        disabled={isSaving}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm"
                        disabled={isSaving}
                      >
                        {isSaving && <Spinner className="mr-2" />}
                        {isSaving ? "Salvando..." : "Salvar"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleEditClick}
                        className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm"
                        disabled={!selectedTemplate}
                      >
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </Tabs>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <p className="mb-4 text-sm">
                    {isLoading
                      ? "Carregando..."
                      : "Selecione um template ou crie um novo"}
                  </p>
                  <Button
                    onClick={handleNewTemplate}
                    className="text-xs sm:text-sm"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog
        open={deleteTemplateId !== null}
        onOpenChange={() => setDeleteTemplateId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTemplate}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Spinner className="mr-2" />}
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}