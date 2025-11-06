"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Plus, Edit2, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export default function TagsPage() {
  const searchParams = useSearchParams()
  const [newTagName, setNewTagName] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTag, setSelectedTag] = useState<{ id: string; name: string } | null>(null)
  const [editTagName, setEditTagName] = useState("")

  // Mock tags data - TODO: Fetch from GET /tags/
  const [tags, setTags] = useState([
    { id: "1", name: "estudos", count: 6 },
    { id: "2", name: "livros", count: 15 },
    { id: "3", name: "trabalho", count: 3 },
    { id: "4", name: "mercado", count: 9 },
    { id: "5", name: "tppe", count: 2 },
    { id: "6", name: "contas", count: 1 },
  ])

  const tagColors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700",
  ]

  const getTagColor = (index: number) => tagColors[index % tagColors.length]

  useEffect(() => {
    const tagParam = searchParams.get("tag")
    if (tagParam) {
      const tag = tags.find((t) => t.name === tagParam)
      if (tag) {
        setSelectedTag(tag)
        setEditTagName(tag.name)
        // Scroll to the tag element
        setTimeout(() => {
          const element = document.getElementById(`tag-${tag.id}`)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
            element.classList.add("ring-2", "ring-primary")
            setTimeout(() => {
              element.classList.remove("ring-2", "ring-primary")
            }, 2000)
          }
        }, 100)
      }
    }
  }, [searchParams, tags])

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      // TODO: Call POST /tags/ with { name: newTagName }
      console.log("[v0] Creating tag:", newTagName)
      setNewTagName("")
    }
  }

  const handleEditTag = () => {
    if (selectedTag && editTagName.trim()) {
      // TODO: Call PATCH /tags/{id} with { name: editTagName }
      console.log("[v0] Editing tag:", selectedTag.id, "to:", editTagName)
      setShowEditDialog(false)
      setSelectedTag(null)
      setEditTagName("")
    }
  }

  const handleDeleteTag = () => {
    if (selectedTag) {
      // TODO: Call DELETE /tags/{id}
      console.log("[v0] Deleting tag:", selectedTag.id)
      setShowDeleteDialog(false)
      setSelectedTag(null)
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Gerenciar Tags</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Crie, edite e organize suas tags</p>
        </div>

        {/* Create New Tag Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Criar Nova Tag</CardTitle>
            <CardDescription className="text-sm">Adicione uma nova tag para organizar suas notas</CardDescription>
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
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Tag
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags List Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Suas Tags</CardTitle>
            <CardDescription className="text-sm">Gerencie todas as suas tags existentes</CardDescription>
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
                      <Badge className={`${getTagColor(index)} text-xs sm:text-sm`}>{tag.name}</Badge>
                      <span className="text-xs sm:text-sm text-muted-foreground">{tag.count} notas</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tag)
                          setEditTagName(tag.name)
                          setShowEditDialog(true)
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
                          setSelectedTag(tag)
                          setShowDeleteDialog(true)
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
                  <p className="text-sm sm:text-base">Nenhuma tag criada ainda</p>
                  <p className="text-xs sm:text-sm">Crie sua primeira tag acima</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Tag Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditTag} disabled={!editTagName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar a tag "{selectedTag?.name}"? Esta tag será removida de todas as notas. Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive hover:bg-destructive/90">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
