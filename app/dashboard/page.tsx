"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, BookOpen, Zap, Hash, FileText } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [quickNote, setQuickNote] = useState("")

  // Mock data
  const recentNotes = [
    { id: 1, title: "Título da Nota", content: "Conteúdo da Nota...", time: "Há Alguns Minutos" },
    { id: 2, title: "Título da Nota", content: "Conteúdo da Nota...", time: "2 Horas atrás" },
  ]

  const templates = [
    { id: 1, title: "Template 1", description: "Descrição do Template" },
    { id: 2, title: "Template 2", description: "Descrição do Template" },
  ]

  const tagColors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "bg-green-100 text-green-700 hover:bg-green-200",
    "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "bg-orange-100 text-orange-700 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 hover:bg-pink-200",
    "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  ]

  const popularTags = [
    { name: "estudos", count: 6, colorIndex: 0 },
    { name: "livros", count: 15, colorIndex: 1 },
    { name: "trabalho", count: 3, colorIndex: 2 },
    { name: "mercado", count: 9, colorIndex: 3 },
    { name: "tppe", count: 2, colorIndex: 4 },
    { name: "contas", count: 1, colorIndex: 5 },
  ]

  const favorites = [
    { id: 1, type: "note", title: "Título da Nota", content: "Conteúdo da Nota...", notebook: "Título do caderno" },
    { id: 2, type: "notebook", title: "Caderno de Estudos", noteCount: 12 },
    { id: 3, type: "note", title: "Título da Nota", content: "Conteúdo da Nota...", notebook: "Título do caderno" },
    { id: 4, type: "notebook", title: "Caderno de Trabalho", noteCount: 8 },
  ]

  const handleSaveQuickNote = () => {
    // TODO: Save quick note
    setQuickNote("")
  }

  const handleNoteClick = (noteId: number) => {
    router.push(`/notes?note=${noteId}`)
  }

  const handleTagClick = (tagName: string) => {
    router.push(`/tags?tag=${tagName}`)
  }

  const handleTemplateClick = (templateId: number) => {
    router.push(`/templates?template=${templateId}`)
  }

  const handleFavoriteClick = (item: any) => {
    if (item.type === "note") {
      router.push(`/notes?note=${item.id}`)
    } else if (item.type === "notebook") {
      router.push(`/notes?notebook=${item.id}`)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            Bem-Vindo
            <br />
            de volta!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Organize suas ideias e mantenha-se produtivo</p>
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
              <Button onClick={handleSaveQuickNote} className="w-full sm:w-auto">
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
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className={`cursor-pointer transition-colors text-xs sm:text-sm ${tagColors[tag.colorIndex]}`}
                  >
                    {tag.name} ({tag.count})
                  </Badge>
                ))}
              </div>
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
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm sm:text-base">{note.title}</h3>
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">{note.time}</p>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateClick(template.id)}
                    className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-sm mb-1">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleFavoriteClick(item)}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
                      <Star className="h-4 w-4 text-[#F6A800] fill-[#F6A800] shrink-0 ml-2" />
                    </div>
                    {item.type === "note" ? (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">{item.content}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {item.notebook}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {item.noteCount} notas
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
