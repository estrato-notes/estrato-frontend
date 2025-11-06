"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TemplateSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateSelectionModal({ open, onOpenChange }: TemplateSelectionModalProps) {
  const router = useRouter()

  // Mock templates
  const templates = [
    { id: 1, title: "Reunião Semanal", description: "Template para atas de reuniões com participantes e ações" },
    { id: 2, title: "Lista de Tarefas", description: "Organize suas tarefas diárias com checkboxes" },
    { id: 3, title: "Notas de Estudo", description: "Estrutura para anotações de aulas e estudos" },
    { id: 4, title: "Planejamento Mensal", description: "Template para planejar metas e objetivos do mês" },
    { id: 5, title: "Diário Pessoal", description: "Espaço para reflexões e pensamentos diários" },
    { id: 6, title: "Brainstorming", description: "Capture ideias criativas de forma organizada" },
  ]

  const handleSelectTemplate = (templateId: number) => {
    onOpenChange(false)
    router.push(`/notes?template=${templateId}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Escolher Template</DialogTitle>
          <DialogDescription>Selecione um template para criar sua nova nota</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="p-4 border rounded-lg text-left hover:bg-accent hover:border-primary transition-colors"
              >
                <h3 className="font-semibold mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
