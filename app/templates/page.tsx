"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Trash2, Bold, Italic, Underline, Code } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(1)
  const [isEditing, setIsEditing] = useState(false)
  const [templateTitle, setTemplateTitle] = useState("Título Template")
  const [templateContent, setTemplateContent] = useState(
    "# Reunião Semanal - {{data}}\n\n## Participantes\n\n## Agenda\n\n## Discussões\n\n## Ações\n\n## Próximos Passos",
  )
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null)

  // Mock data
  const templates = [
    { id: 1, title: "Título do Template", time: "agora" },
    { id: 2, title: "Título do Template", time: "agora" },
    { id: 3, title: "Título do Template", time: "agora" },
    { id: 4, title: "Título do Template", time: "agora" },
  ]

  const handleNewTemplate = () => {
    setSelectedTemplate(null)
    setIsEditing(true)
    setTemplateTitle("")
    setTemplateContent("")
  }

  const handleSave = () => {
    // TODO: Save template logic
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (selectedTemplate === null) {
      setSelectedTemplate(1)
    }
  }

  const handleUseTemplate = () => {
    // TODO: Create note from template
    window.location.href = "/notes?template=" + selectedTemplate
  }

  const handleDeleteTemplate = (templateId: number) => {
    setDeleteTemplateId(templateId)
  }

  const confirmDeleteTemplate = () => {
    // TODO: Delete template logic
    console.log("Delete template:", deleteTemplateId)
    setDeleteTemplateId(null)
  }

  const applyFormatting = (format: string) => {
    // TODO: Implement markdown formatting
    console.log("Apply formatting:", format)
  }

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

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Meus Templates</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Column 1: Templates List */}
          <div className="bg-card rounded-lg border overflow-hidden flex flex-col max-h-[400px] lg:max-h-none">
            <div className="p-3 sm:p-4 border-b">
              <Button onClick={handleNewTemplate} className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {templates.map((template) => (
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
                          setSelectedTemplate(template.id)
                          setIsEditing(false)
                        }}
                        className="flex-1 text-left"
                      >
                        <h3 className="font-semibold text-xs sm:text-sm mb-1">{template.title}</h3>
                        <span className="text-xs text-muted-foreground">{template.time}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive/80 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Template Editor/Viewer */}
          <div className="bg-card rounded-lg border overflow-hidden flex flex-col">
            {selectedTemplate !== null || isEditing ? (
              <>
                <div className="p-3 sm:p-4 border-b space-y-3 sm:space-y-4">
                  <Input
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    disabled={!isEditing}
                    className="text-base sm:text-lg font-semibold"
                    placeholder="Título do Template"
                  />

                  {isEditing && (
                    <div className="flex items-center gap-1 pt-2 border-t overflow-x-auto">
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
                      <Button variant="ghost" size="sm" onClick={() => applyFormatting("bold")} className="h-8 px-2">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => applyFormatting("italic")} className="h-8 px-2">
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
                      <Button variant="ghost" size="sm" onClick={() => applyFormatting("code")} className="h-8 px-2">
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                  <div className="mb-2 text-xs sm:text-sm font-medium text-muted-foreground">Conteúdo do Template</div>
                  <Textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    disabled={!isEditing}
                    className="min-h-[300px] sm:min-h-full border-0 focus-visible:ring-0 resize-none font-mono text-xs sm:text-sm"
                    placeholder="Digite o conteúdo do template..."
                  />
                </div>

                <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm">
                        Salvar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleUseTemplate}
                        className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                      >
                        Usar Template
                      </Button>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm"
                      >
                        Editar
                      </Button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
                <div className="text-center">
                  <p className="mb-4 text-sm">Selecione um template ou crie um novo</p>
                  <Button onClick={handleNewTemplate} className="text-xs sm:text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteTemplateId !== null} onOpenChange={() => setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
