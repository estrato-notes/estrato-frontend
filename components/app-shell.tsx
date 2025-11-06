"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Search, Plus, FileText, Layout, LogOut, User, Hash, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NewNoteModal } from "@/components/new-note-modal"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"

interface AppShellProps {
  children: ReactNode
}

type SearchResult = {
  id: string
  name: string
  type: "note" | "notebook" | "tag" | "template"
  snippet?: string
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const user = {
    name: "João Silva",
    email: "joao@email.com",
    avatar: "/user-avatar.png",
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)

    const mockResults: SearchResult[] = [
      { id: "1", name: "Nota sobre React", type: "note", snippet: "Conteúdo sobre hooks..." },
      { id: "2", name: "Estudos", type: "notebook" },
      { id: "3", name: "javascript", type: "tag" },
      { id: "4", name: "Template de Reunião", type: "template", snippet: "Template para reuniões semanais" },
    ]

    setTimeout(() => {
      setSearchResults(mockResults.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())))
      setIsSearching(false)
    }, 300)
  }

  const handleResultClick = (result: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery("")

    switch (result.type) {
      case "note":
        router.push(`/notes?note=${result.id}`)
        break
      case "notebook":
        router.push(`/notes?notebook=${result.id}`)
        break
      case "tag":
        router.push(`/notes?tag=${result.id}`)
        break
      case "template":
        router.push(`/templates?template=${result.id}`)
        break
    }
  }

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "note":
        return <FileText className="h-4 w-4" />
      case "notebook":
        return <Layout className="h-4 w-4" />
      case "tag":
        return <Hash className="h-4 w-4" />
      case "template":
        return <FileText className="h-4 w-4" />
    }
  }

  const getResultTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "note":
        return "Nota"
      case "notebook":
        return "Caderno"
      case "tag":
        return "Tag"
      case "template":
        return "Template"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        {/* Linha 1: Header Principal */}
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 border-b">
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Menu de Navegação</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard" onClick={() => setShowMobileMenu(false)}>
                  <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Layout className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/notes" onClick={() => setShowMobileMenu(false)}>
                  <Button variant={pathname === "/notes" ? "secondary" : "ghost"} className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Minhas Notas
                  </Button>
                </Link>

                <Link href="/templates" onClick={() => setShowMobileMenu(false)}>
                  <Button variant={pathname === "/templates" ? "secondary" : "ghost"} className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Templates
                  </Button>
                </Link>

                <Link href="/tags" onClick={() => setShowMobileMenu(false)}>
                  <Button variant={pathname === "/tags" ? "secondary" : "ghost"} className="w-full justify-start">
                    <Hash className="mr-2 h-4 w-4" />
                    Gerenciar Tags
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo - Left */}
          <Link href="/dashboard" className="flex items-center shrink-0">
            <img src="/logo-blue.svg" alt="Estrato Logo" className="h-8 w-auto" />
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl mx-auto">
            <Popover open={showSearchResults} onOpenChange={setShowSearchResults}>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar notas, cadernos, tags..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                    className="w-full pl-10"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[90vw] md:w-[600px] p-0" align="center">
                <div className="max-h-[400px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full px-4 py-3 hover:bg-accent text-left transition-colors flex items-start gap-3"
                        >
                          <div className="mt-1 text-muted-foreground">{getResultIcon(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{result.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {getResultTypeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.snippet && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{result.snippet}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">Nenhum resultado encontrado</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right Side - New Note Button + User Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* New Note Button */}
            <Button onClick={() => setShowNewNoteModal(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nova Nota</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/user-avatar.png"} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Linha 2: Navegação de Abas */}
        <div className="hidden lg:flex h-12 items-center px-6 border-b">
          <nav className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className={pathname === "/dashboard" ? "border-b-2 border-primary rounded-none" : ""}
              >
                <Layout className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            <Link href="/notes">
              <Button
                variant="ghost"
                size="sm"
                className={pathname === "/notes" ? "border-b-2 border-primary rounded-none" : ""}
              >
                <FileText className="mr-2 h-4 w-4" />
                Minhas Notas
              </Button>
            </Link>

            <Link href="/templates">
              <Button
                variant="ghost"
                size="sm"
                className={pathname === "/templates" ? "border-b-2 border-primary rounded-none" : ""}
              >
                <FileText className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </Link>

            <Link href="/tags">
              <Button
                variant="ghost"
                size="sm"
                className={pathname === "/tags" ? "border-b-2 border-primary rounded-none" : ""}
              >
                <Hash className="mr-2 h-4 w-4" />
                Gerenciar Tags
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden sticky top-16 z-40 bg-background border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      <main className="p-4 sm:p-6">{children}</main>

      {/* New Note Modal */}
      <NewNoteModal open={showNewNoteModal} onOpenChange={setShowNewNoteModal} />
    </div>
  )
}
