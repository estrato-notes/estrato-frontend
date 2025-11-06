"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  Plus,
  Bold,
  Italic,
  Underline,
  Code,
  MoreVertical,
  Star,
  BookOpen,
  Trash2,
  Edit2,
  FolderInput,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TemplateSelectionModal } from "@/components/template-selection-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
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

export default function NotesPage() {
  const [selectedNotebook, setSelectedNotebook] = useState("all")
  const [selectedNote, setSelectedNote] = useState<number | null>(1)
  const [noteTitle, setNoteTitle] = useState("Título Nota")
  const [noteContent, setNoteContent] = useState("# Nova Nota\n\nComece a escrever aqui...")
  const [noteTags, setNoteTags] = useState(["nova tag"])
  const [newTag, setNewTag] = useState("")
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [newNotebookName, setNewNotebookName] = useState("")
  const [favoriteNotes, setFavoriteNotes] = useState<number[]>([1])
  const [favoriteNotebooks, setFavoriteNotebooks] = useState<string[]>(["estudos"])
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false)
  const [showDeleteNotebookDialog, setShowDeleteNotebookDialog] = useState(false)
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null)
  const [showRenameNotebookModal, setShowRenameNotebookModal] = useState(false)
  const [notebookToRename, setNotebookToRename] = useState<string | null>(null)
  const [renameNotebookValue, setRenameNotebookValue] = useState("")
  const [showMoveNoteDialog, setShowMoveNoteDialog] = useState(false)
  const [noteToMove, setNoteToMove] = useState<number | null>(null)

  const notebooks = [
    { id: "all", name: "Todas as Notas", count: 30 },
    { id: "estudos", name: "Estudos", count: 4 },
    { id: "financas", name: "Finanças", count: 5 },
    { id: "ingles", name: "Inglês", count: 1 },
    { id: "outros", name: "Outros", count: 20 },
  ]

  const tagColors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "bg-green-100 text-green-700 hover:bg-green-200",
    "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "bg-orange-100 text-orange-700 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 hover:bg-pink-200",
    "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  ]

  const getTagColor = (index: number) => tagColors[index % tagColors.length]

  const notes = [
    { id: 1, title: "Título da Nota", content: "Descrição da Nota...", tags: ["eda2", "hash"], time: "agora" },
    { id: 2, title: "Título da Nota", content: "Descrição da Nota...", tags: ["eda2", "hash"], time: "agora" },
    { id: 3, title: "Título da Nota", content: "Descrição da Nota...", tags: [], time: "agora" },
    { id: 4, title: "Título da Nota", content: "Descrição da Nota...", tags: ["eda2", "hash"], time: "agora" },
  ]

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNoteTags([...noteTags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setNoteTags(noteTags.filter((tag) => tag !== tagToRemove))
  }

  const handleCreateNotebook = () => {
    // TODO: Create notebook logic
    setShowNewNotebookModal(false)
    setNewNotebookName("")
  }

  const handleRenameNotebook = () => {
    // TODO: Call PATCH /notebooks/{id} with new name
    console.log("[v0] Renaming notebook:", notebookToRename, "to:", renameNotebookValue)
    setShowRenameNotebookModal(false)
    setNotebookToRename(null)
    setRenameNotebookValue("")
  }

  const handleMoveNote = (targetNotebookId: string) => {
    // TODO: Call PATCH /notebooks/{notebook_id}/notes/{note_id} with new notebook_id
    console.log("[v0] Moving note:", noteToMove, "to notebook:", targetNotebookId)
    setShowMoveNoteDialog(false)
    setNoteToMove(null)
  }

  const applyFormatting = (format: string) => {
    // TODO: Implement markdown formatting
    console.log("Apply formatting:", format)
  }

  const toggleNoteFavorite = (noteId: number) => {
    setFavoriteNotes((prev) => (prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId]))
  }

  const toggleNotebookFavorite = (notebookId: string) => {
    setFavoriteNotebooks((prev) =>
      prev.includes(notebookId) ? prev.filter((id) => id !== notebookId) : [...prev, notebookId],
    )
  }

  const handleCreateTemplateFromNote = () => {
    setShowCreateTemplateModal(true)
  }

  const handleDeleteNote = () => {
    // TODO: Delete note logic
    setShowDeleteNoteDialog(false)
    setSelectedNote(null)
  }

  const handleDeleteNotebook = () => {
    // TODO: Delete notebook logic
    setShowDeleteNotebookDialog(false)
    setNotebookToDelete(null)
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Minhas Notas</h1>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Column 1: Notebooks (Cadernos) */}
          <div className="lg:col-span-3 bg-card rounded-lg border p-4 overflow-y-auto max-h-[300px] lg:max-h-none">
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-3 text-sm sm:text-base">Cadernos</h2>
                <div className="space-y-1">
                  {notebooks.map((notebook) => (
                    <div key={notebook.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNotebookFavorite(notebook.id)}
                        className="flex-shrink-0 text-muted-foreground hover:text-[#F6A800] transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favoriteNotebooks.includes(notebook.id) ? "fill-[#F6A800] text-[#F6A800]" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedNotebook(notebook.id)}
                        className={`flex-1 text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                          selectedNotebook === notebook.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{notebook.name}</span>
                          <span className="text-xs ml-2">{notebook.count}</span>
                        </div>
                      </button>
                      {notebook.id !== "all" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setNotebookToRename(notebook.id)
                                setRenameNotebookValue(notebook.name)
                                setShowRenameNotebookModal(true)
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setNotebookToDelete(notebook.id)
                                setShowDeleteNotebookDialog(true)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Apagar Caderno
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent text-xs sm:text-sm"
                onClick={() => setShowNewNotebookModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Caderno
              </Button>

              <div className="pt-4 border-t">
                <h2 className="font-semibold mb-3 text-sm sm:text-base">Templates</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={() => (window.location.href = "/templates")}
                >
                  Gerenciar Templates
                </Button>
              </div>
            </div>
          </div>

          {/* Column 2: Notes List */}
          <div className="lg:col-span-4 bg-card rounded-lg border overflow-hidden flex flex-col max-h-[400px] lg:max-h-none">
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-2">
                {notes.map((note, noteIndex) => (
                  <div
                    key={note.id}
                    className={`p-2 sm:p-3 rounded-lg transition-colors ${
                      selectedNote === note.id
                        ? "bg-primary/10 border-primary border"
                        : "hover:bg-accent border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleNoteFavorite(note.id)}
                        className="flex-shrink-0 mt-1 text-muted-foreground hover:text-[#F6A800] transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favoriteNotes.includes(note.id) ? "fill-[#F6A800] text-[#F6A800]" : ""
                          }`}
                        />
                      </button>
                      <div onClick={() => setSelectedNote(note.id)} className="flex-1 cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xs sm:text-sm">{note.title}</h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <FolderInput className="h-4 w-4 mr-2" />
                                  Mover para...
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {notebooks
                                    .filter((nb) => nb.id !== "all" && nb.id !== selectedNotebook)
                                    .map((notebook) => (
                                      <DropdownMenuItem
                                        key={notebook.id}
                                        onClick={() => {
                                          setNoteToMove(note.id)
                                          handleMoveNote(notebook.id)
                                        }}
                                      >
                                        {notebook.name}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem
                                onClick={() => setShowDeleteNoteDialog(true)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Apagar Nota
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{note.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.tags.map((tag, tagIndex) => (
                            <Badge key={tag} className={`text-xs ${getTagColor(tagIndex)}`}>
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground ml-auto">{note.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Note Editor */}
          <div className="lg:col-span-5 bg-card rounded-lg border overflow-hidden flex flex-col">
            <div className="p-3 sm:p-4 border-b space-y-3 sm:space-y-4">
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-base sm:text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                placeholder="Título da Nota"
              />

              <div className="flex items-center gap-2 flex-wrap">
                {noteTags.map((tag, index) => (
                  <Badge
                    key={tag}
                    className={`cursor-pointer text-xs ${getTagColor(index)}`}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="nova tag"
                    className="h-7 w-20 sm:w-24 text-xs"
                  />
                  <Button size="sm" variant="ghost" onClick={handleAddTag}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 pt-2 border-t overflow-x-auto">
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("h1")} className="h-8 px-2 text-xs">
                  H1
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("h2")} className="h-8 px-2 text-xs">
                  H2
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("h3")} className="h-8 px-2 text-xs">
                  H3
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("bold")} className="h-8 px-2">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("italic")} className="h-8 px-2">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("underline")} className="h-8 px-2">
                  <Underline className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("code")} className="h-8 px-2">
                  <Code className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-3 sm:p-4 overflow-y-auto min-h-0">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="h-full min-h-[300px] sm:min-h-[400px] border-0 focus-visible:ring-0 resize-none font-mono text-xs sm:text-sm"
                placeholder="Comece a escrever aqui..."
              />
            </div>

            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm bg-transparent">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Mais Opções
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowTemplateModal(true)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Novo do Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCreateTemplateFromNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Template desta Nota
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm">Salvar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* New Notebook Modal */}
      <Dialog open={showNewNotebookModal} onOpenChange={setShowNewNotebookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Caderno</DialogTitle>
            <DialogDescription>Digite um nome para o novo caderno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notebook-name">Nome do Caderno:</Label>
              <Input
                id="notebook-name"
                placeholder="Ex.: Jogos"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewNotebookModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateNotebook}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Notebook Modal */}
      <Dialog open={showRenameNotebookModal} onOpenChange={setShowRenameNotebookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Caderno</DialogTitle>
            <DialogDescription>Digite o novo nome para o caderno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-notebook">Nome do Caderno:</Label>
              <Input
                id="rename-notebook"
                placeholder="Ex.: Projetos"
                value={renameNotebookValue}
                onChange={(e) => setRenameNotebookValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameNotebookModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenameNotebook}>Renomear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <TemplateSelectionModal open={showTemplateModal} onOpenChange={setShowTemplateModal} />

      {/* Create Template from Note Modal */}
      <Dialog open={showCreateTemplateModal} onOpenChange={setShowCreateTemplateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Template desta Nota</DialogTitle>
            <DialogDescription>Esta nota será salva como um template que você pode reutilizar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Título do Template:</Label>
              <Input id="template-title" placeholder="Ex.: Reunião Semanal" defaultValue={noteTitle} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTemplateModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // TODO: Save template logic
                setShowCreateTemplateModal(false)
              }}
            >
              Criar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteNoteDialog} onOpenChange={setShowDeleteNoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} className="bg-destructive hover:bg-destructive/90">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteNotebookDialog} onOpenChange={setShowDeleteNotebookDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Caderno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar este caderno? Todas as notas dentro dele serão movidas para "Outras Notas".
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotebook} className="bg-destructive hover:bg-destructive/90">
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
