"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Layout } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TemplateSelectionModal } from "@/components/template-selection-modal"

interface NewNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewNoteModal({ open, onOpenChange }: NewNoteModalProps) {
  const router = useRouter()
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const handleCreateFromScratch = () => {
    onOpenChange(false)
    router.push("/notes?new=true")
  }

  const handleCreateFromTemplate = () => {
    onOpenChange(false)
    setShowTemplateModal(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Criar uma nova nota</DialogTitle>
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
            >
              <Layout className="h-8 w-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">Criar a partir de template</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TemplateSelectionModal open={showTemplateModal} onOpenChange={setShowTemplateModal} />
    </>
  )
}
