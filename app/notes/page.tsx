"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  FileText,
  Eye,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { TemplateSelectionModal } from "@/components/template-selection-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ReactMarkdown from "react-markdown";
import api from "@/lib/api/api";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
}

interface Notebook {
  id: string;
  name: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string | null;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
  is_favorite: boolean;
  notebook_id: string;
  created_at: string;
  updated_at: string | null;
  tags: Tag[];
}

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newNoteParam = searchParams.get("new");
  const noteIdParam = searchParams.get("note");
  const notebookIdParam = searchParams.get("notebook");

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [isLoadingNotebooks, setIsLoadingNotebooks] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingNoteContent, setIsLoadingNoteContent] = useState(false);

  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");

  const [favoriteNotes, setFavoriteNotes] = useState<string[]>([]);
  const [favoriteNotebooks, setFavoriteNotebooks] = useState<string[]>([]);

  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [showDeleteNotebookDialog, setShowDeleteNotebookDialog] =
    useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<string | null>(null);
  const [showRenameNotebookModal, setShowRenameNotebookModal] = useState(false);
  const [notebookToRename, setNotebookToRename] = useState<string | null>(null);
  const [renameNotebookValue, setRenameNotebookValue] = useState("");
  const [notebookIdForTemplate, setNotebookIdForTemplate] =
    useState<string>("");
  const [showMoveNoteDialog, setShowMoveNoteDialog] = useState(false);
  const [noteToMove, setNoteToMove] = useState<string | null>(null);
  const [showNotebookSheet, setShowNotebookSheet] = useState(false);
  const [showNoteSheet, setShowNoteSheet] = useState(false);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isRenamingNotebook, setIsRenamingNotebook] = useState(false);
  const [isDeletingNotebook, setIsDeletingNotebook] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [togglingFavoriteNotes, setTogglingFavoriteNotes] = useState(
    new Set<string>()
  );
  const [togglingFavoriteNotebooks, setTogglingFavoriteNotebooks] = useState(
    new Set<string>()
  );
  const [isMovingNote, setIsMovingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tagColors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "bg-green-100 text-green-700 hover:bg-green-200",
    "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "bg-orange-100 text-orange-700 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 hover:bg-pink-200",
    "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  ];

  const getTagColor = (index: number) => tagColors[index % tagColors.length];

  useEffect(() => {
    const fetchNotebooks = async () => {
      setIsLoadingNotebooks(true);
      try {
        const response = await api.get<Notebook[]>("/notebooks/");

        setFavoriteNotebooks(
          response.data.filter((nb) => nb.is_favorite).map((nb) => nb.id)
        );

        const allNotesNotebook: Notebook = {
          id: "all",
          name: "Todas as Notas",
          is_favorite: false,
          created_at: "",
          updated_at: null,
        };

        const notebooksData = [allNotesNotebook, ...response.data];
        setNotebooks(notebooksData);

        if (newNoteParam === "true") {
          const qcNotebook = notebooksData.find(
            (nb) => nb.name === "Capturas Rápidas"
          );
          setSelectedNotebook(qcNotebook?.id || "all");
        } else if (notebookIdParam) {
          setSelectedNotebook(notebookIdParam);
        } else {
          setSelectedNotebook("all");
        }
      } catch (err: any) {
        console.error("Erro ao buscar cadernos: ", err);
        if (err.response && err.response.status === 401) {
          router.push("/login");
        }
      } finally {
        setIsLoadingNotebooks(false);
      }
    };

    const fetchTags = async () => {
      try {
        const response = await api.get<Tag[]>("/tags/");
        setAllUserTags(response.data);
      } catch (err) {
        console.error("Erro ao buscar todas as tags: ", err);
      }
    };

    fetchNotebooks();
    fetchTags();
  }, [router]);

  useEffect(() => {
    if (!selectedNotebook) return;

    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      setNotes([]);
      setSelectedNote(null);

      try {
        let response;
        if (selectedNotebook === "all") {
          response = await api.get<Note[]>("/notes/");
        } else {
          response = await api.get<Note[]>(
            `/notebooks/${selectedNotebook}/notes/`
          );
        }

        const newNotes = response.data;
        setNotes(newNotes);

        const qcNotebook = notebooks.find(
          (nb) => nb.name === "Capturas Rápidas"
        );

        if (newNoteParam === "true" && selectedNotebook === qcNotebook?.id) {
          setSelectedNote(null); 
          router.replace("/notes", { scroll: false }); 
        } else if (noteIdParam && notebookIdParam === selectedNotebook) {
          if (newNotes.some((n) => n.id === noteIdParam)) {
            setSelectedNote(noteIdParam);
          } else if (newNotes.length > 0) {
            setSelectedNote(newNotes[0].id);
          }
          router.replace("/notes", { scroll: false });
        } else if (newNotes.length > 0) {
          setSelectedNote(newNotes[0].id);
        } else {
          setSelectedNote(null);
        }
      } catch (err: any) {
        console.error("Erro ao buscar notas: ", err);
        setNotes([]);
        if (err.response && err.response.status === 401) {
          router.push("/login");
        }
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [selectedNotebook, router]);

  useEffect(() => {
    if (!selectedNote) {
      setNoteTitle("");
      setNoteContent("");
      setNoteTags([]);
      setIsLoadingNoteContent(false);
      return;
    }

    const note = notes.find((n) => n.id === selectedNote);

    if (note) {
      setIsLoadingNoteContent(true);
      setNoteTitle(note.title);
      setNoteContent(note.content || "");
      setNoteTags(note.tags || []);
      setIsLoadingNoteContent(false);
    }
  }, [selectedNote, notes]);

  useEffect(() => {
    if (newTag.trim().length > 0) {
      const noteTagIds = new Set(noteTags.map((t) => t.id));

      const filtered = allUserTags.filter(
        (tag) =>
          !noteTagIds.has(tag.id) &&
          tag.name.toLowerCase().includes(newTag.toLowerCase())
      );

      setTagSuggestions(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setTagSuggestions([]);
      setShowTagSuggestions(false);
    }
  }, [newTag, allUserTags, noteTags]);


  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedNote) return;

    if (
      noteTags.some((t) => t.name.toLowerCase() === newTag.trim().toLowerCase())
    ) {
      toast.info("Tag já adicionada a esta nota.");
      setNewTag("");
      return;
    }

    const note = notes.find((n) => n.id === selectedNote);
    if (!note) return;

    setIsTagLoading(true);
    const toastId = toast.loading("Adicionando tag...");

    try {
      let tagToAdd: Tag | undefined = allUserTags.find(
        (t) => t.name.toLowerCase() === newTag.trim().toLowerCase()
      );

      if (!tagToAdd) {
        const createTagResponse = await api.post<Tag>("/tags/", {
          name: newTag.trim(),
        });
        tagToAdd = createTagResponse.data;
        setAllUserTags([...allUserTags, tagToAdd]);
      }

      await api.post(
        `/notebooks/${note.notebook_id}/notes/${note.id}/tags/${tagToAdd.id}`
      );

      setNoteTags([...noteTags, tagToAdd]);
      setNewTag("");
      toast.success("Tag adicionada!", { id: toastId });
    } catch (err: any) {
      console.error("Erro ao adicionar tag:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro: A tag já existe.", { id: toastId });
      } else {
        toast.error("Erro ao adicionar tag.", { id: toastId });
      }
    } finally {
      setIsTagLoading(false);
    }
  };

  const handleRemoveTag = async (tagIdToRemove: string) => {
    if (!selectedNote) return;
    const note = notes.find((n) => n.id === selectedNote);
    if (!note) return;

    const toasId = toast.loading("Removendo tag...");

    try {
      await api.delete(
        `/notebooks/${note.notebook_id}/notes/${note.id}/tags/${tagIdToRemove}`
      );
      setNoteTags(noteTags.filter((tag) => tag.id !== tagIdToRemove));
      toast.success("Tag removida.", { id: toasId });
    } catch (err) {
      console.error("Erro ao remover tag: ", err);
      toast.error("Erro ao remover tag.", { id: toasId });
    }
  };

  const handleAssociateTag = async (tag: Tag) => {
    if (!selectedNote) return;
    const note = notes.find((n) => n.id === selectedNote);
    if (!note) return;

    if (noteTags.some((t) => t.id === tag.id)) {
      setNewTag("");
      setShowTagSuggestions(false);
      return;
    }

    setIsTagLoading(true);
    const toastId = toast.loading("Adicionando tag...");

    try {
      await api.post(
        `/notebooks/${note.notebook_id}/notes/${note.id}/tags/${tag.id}`
      );

      setNoteTags([...noteTags, tag]);
      setNewTag("");
      setShowTagSuggestions(false);
      toast.success("Tag adicionada!", { id: toastId });
    } catch (err: any) {
      console.error("Erro ao associar tag:", err);
      toast.error("Erro ao associar tag.", { id: toastId });
    } finally {
      setIsTagLoading(false);
    }
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      toast.error("O nome do caderno não pose estar vazio.");
      return;
    }

    setIsCreatingNotebook(true);
    const toastId = toast.loading("Criando caderno...");

    try {
      const response = await api.post<Notebook>("/notebooks", {
        name: newNotebookName.trim(),
      });

      const newNotebook = response.data;

      setNotebooks((prev) => [...prev, newNotebook]);

      toast.success("Caderno criado com sucesso!", {
        id: toastId,
        description: newNotebook.name,
      });

      setShowNewNotebookModal(false);
      setNewNotebookName("");
    } catch (err: any) {
      console.error("Erro ao criar caderno: ", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro ao criar", {
          id: toastId,
          description: "Um caderno com esse nome já existe.",
        });
      } else {
        toast.error("Erro ao criar caderno", {
          id: toastId,
          description: "Tente novamente mais tarde.",
        });
      }
    } finally {
      setIsCreatingNotebook(false);
    }
  };

  const handleRenameNotebook = async () => {
    if (!notebookToRename || !renameNotebookValue.trim()) {
      toast.error("O nome do caderno não pode ficar vazio.");
      return;
    }

    setIsRenamingNotebook(true);

    const toastId = toast.loading("Renomeando caderno...");

    try {
      const response = await api.patch<Notebook>(
        `/notebooks/${notebookToRename}`,
        {
          name: renameNotebookValue.trim(),
        }
      );

      setNotebooks((prev) =>
        prev.map((nb) => (nb.id === notebookToRename ? response.data : nb))
      );

      toast.success("Caderno renomeado com sucesso!", { id: toastId });
      setShowRenameNotebookModal(false);
      setNotebookToRename(null);
      setRenameNotebookValue("");
    } catch (err: any) {
      console.error("Erro ao renomear caderno:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro: Já existe um caderno com esse nome.", {
          id: toastId,
        });
      } else {
        toast.error("Erro ao renomear caderno. Tente novamente.", {
          id: toastId,
        });
      }
    } finally {
      setIsRenamingNotebook(false);
    }
  };

  const handleMoveNote = async (targetNotebookId: string) => {
    const noteIdToMove = noteToMove;
    if (!noteIdToMove) return;

    const noteToMoveObj = notes.find((n) => n.id === noteIdToMove);
    if (!noteToMoveObj || isMovingNote) return;

    setIsMovingNote(true);
    const toastId = toast.loading("Movendo nota...");

    try {
      await api.patch(
        `/notebooks/${noteToMoveObj.notebook_id}/notes/${noteToMoveObj.id}`,
        { notebook_id: targetNotebookId }
      );

      setNotes((prev) => prev.filter((n) => n.id !== noteIdToMove));

      if (selectedNote === noteIdToMove) {
        setSelectedNote(null);
      }

      toast.success("Nota movida com sucesso!", { id: toastId });
    } catch (err: any) {
      console.error("Erro ao mover nota:", err);
      toast.error("Erro ao mover nota. Tente novamente.", { id: toastId });
    } finally {
      setIsMovingNote(false);
      setNoteToMove(null);
    }
  };

  const applyFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteContent.substring(start, end);

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
      noteContent.substring(0, start) + markdown + noteContent.substring(end);

    setNoteContent(newContent);

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

  const handleAddNewNote = () => {
    setSelectedNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags([]);
    setShowNoteSheet(false);
    router.replace("/notes", { scroll: false });
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    const toastId = toast.loading("Salvando nota...");

    try {
      if (selectedNote) {
        const noteToSave = notes.find((n) => n.id === selectedNote);
        if (!noteToSave) {
          throw new Error("Nota selecionada não encontrada para atualização.");
        }

        const response = await api.patch<Note>(
          `/notebooks/${noteToSave.notebook_id}/notes/${noteToSave.id}`,
          {
            title: noteTitle || "Nota sem título",
            content: noteContent,
          }
        );

        setNotes((prev) =>
          prev.map((n) => (n.id === selectedNote ? response.data : n))
        );

        toast.success("Nota salva com sucesso!", { id: toastId });
      } else {
        if (!selectedNotebook) {
          toast.error("Erro: Nenhum caderno selecionado.", { id: toastId });
          return;
        }

        let targetNotebookId = selectedNotebook;

        if (targetNotebookId === "all") {
          const quickCaptureNotebook = notebooks.find(
            (nb) => nb.name === "Capturas Rápidas"
          );
          if (!quickCaptureNotebook) {
            toast.error("Caderno 'Capturas Rápidas' não encontrado.", {
              id: toastId,
            });
            return;
          }
          targetNotebookId = quickCaptureNotebook.id;
        }

        const response = await api.post<Note>(
          `/notebooks/${targetNotebookId}/notes/`,
          {
            title: noteTitle || "Nova Nota",
            content: noteContent,
          }
        );

        const newNote = response.data;

        setNotes((prev) => [newNote, ...prev]);

        if (
          selectedNotebook === "all" ||
          selectedNotebook === targetNotebookId
        ) {
          setNotes((prev) => [
            newNote,
            ...prev.filter((n) => n.id !== newNote.id),
          ]);
        } else {
          setSelectedNotebook(targetNotebookId);
        }

        setSelectedNote(newNote.id);
        setNoteTags(newNote.tags || []);

        toast.success("Nota criada com sucesso!", { id: toastId });
      }
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
      toast.error("Erro ao salvar nota. Tente novamente.", { id: toastId });
    } finally {
      setIsSavingNote(false);
    }
  };

  const toggleNoteFavorite = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || togglingFavoriteNotes.has(noteId)) return;

    const newIsFavorite = !favoriteNotes.includes(noteId);
    setTogglingFavoriteNotes((prev) => new Set(prev).add(noteId));
    setFavoriteNotes((prev) =>
      newIsFavorite ? [...prev, noteId] : prev.filter((id) => id !== noteId)
    );

    try {
      await api.patch(`/notebooks/${note.notebook_id}/notes/${note.id}`, {
        is_favorite: newIsFavorite,
      });
    } catch (err) {
      console.error("Erro ao favoritar nota:", err);
      toast.error("Erro ao atualizar favorito.");
      setFavoriteNotes((prev) =>
        newIsFavorite ? prev.filter((id) => id !== noteId) : [...prev, noteId]
      );
    } finally {
      setTogglingFavoriteNotes((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
    }
  };

  const toggleNotebookFavorite = async (notebookId: string) => {
    if (notebookId === "all" || togglingFavoriteNotebooks.has(notebookId))
      return;

    const newIsFavorite = !favoriteNotebooks.includes(notebookId);

    setTogglingFavoriteNotebooks((prev) => new Set(prev).add(notebookId));
    setFavoriteNotebooks((prev) =>
      newIsFavorite
        ? [...prev, notebookId]
        : prev.filter((id) => id !== notebookId)
    );

    try {
      await api.patch(`/notebooks/${notebookId}`, {
        is_favorite: newIsFavorite,
      });
    } catch (err) {
      console.error("Erro ao favoritar caderno:", err);
      toast.error("Erro ao atualizar favorito.");
      setFavoriteNotebooks((prev) =>
        newIsFavorite
          ? prev.filter((id) => id !== notebookId)
          : [...prev, notebookId]
      );
    } finally {
      setTogglingFavoriteNotebooks((prev) => {
        const next = new Set(prev);
        next.delete(notebookId);
        return next;
      });
    }
  };

  const handleCreateTemplateFromNote = () => {
    const note = notes.find((n) => n.id === selectedNote);
    setNewTemplateName(note?.title || "Novo Template");
    setShowCreateTemplateModal(true);
  };

  const handleConfirmCreateTemplate = async () => {
    const noteToTemplate = notes.find((n) => n.id === selectedNote);

    if (!noteToTemplate) {
      toast.error("Erro: Nenhuma nota selecionada.");
      return;
    }

    if (!newTemplateName.trim()) {
      toast.error("O nome do template não pode ficar vazio.");
      return;
    }

    setIsCreatingTemplate(true);
    const toastId = toast.loading("Criando template...");

    try {
      await api.post(
        `/notebooks/${noteToTemplate.notebook_id}/notes/${noteToTemplate.id}/templates`,
        {
          name: newTemplateName.trim(),
        }
      );

      toast.success("Template criado com sucesso!", { id: toastId });
      setShowCreateTemplateModal(false);
      setNewTemplateName("");
    } catch (err: any) {
      console.error("Erro ao criar template:", err);
      if (err.response && err.response.status === 409) {
        toast.error("Erro: Um template com esse nome já existe.", {
          id: toastId,
        });
      } else {
        toast.error("Erro ao criar template. Tente novamente.", {
          id: toastId,
        });
      }
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleDeleteNote = async () => {
    const noteToDelete = notes.find((n) => n.id === selectedNote);
    if (!noteToDelete) return;

    setIsDeletingNote(true);
    const toastId = toast.loading("Apagando nota...");

    try {
      await api.delete(
        `/notebooks/${noteToDelete.notebook_id}/notes/${noteToDelete.id}`
      );

      const newNotesList = notes.filter((n) => n.id !== selectedNote);
      setNotes(newNotesList);

      if (newNotesList.length > 0) {
        setSelectedNote(newNotesList[0].id);
      } else {
        setSelectedNote(null);
      }

      toast.success("Nota apagada com sucesso!", { id: toastId });
      setShowDeleteNoteDialog(false);
    } catch (err: any) {
      console.error("Erro ao apagar nota:", err);
      toast.error("Erro ao apagar nota. Tente novamente.", { id: toastId });
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleDeleteNotebook = async () => {
    if (!notebookToDelete) return;

    setIsDeletingNotebook(true);
    const toastId = toast.loading("Apagando caderno...");

    try {
      await api.delete(`/notebooks/${notebookToDelete}`);

      setNotebooks((prev) => prev.filter((nb) => nb.id !== notebookToDelete));

      if (selectedNotebook === notebookToDelete) {
        setSelectedNotebook("all");
      }

      toast.success("Caderno apagado com sucesso!", { id: toastId });
      setShowDeleteNotebookDialog(false);
      setNotebookToDelete(null);
    } catch (err: any) {
      console.error("Erro ao apagar caderno:", err);
      if (err.response && err.response.status === 403) {
        toast.error("Erro: Este caderno não pode ser excluído.", {
          id: toastId,
        });
      } else {
        toast.error("Erro ao apagar caderno. Tente novamente.", {
          id: toastId,
        });
      }
    } finally {
      setIsDeletingNotebook(false);
    }
  };

  const selectedNotebookName =
    notebooks.find((nb) => nb.id === selectedNotebook)?.name || "Caderno";
  const selectedNoteTitle =
    notes.find((n) => n.id === selectedNote)?.title ||
    (selectedNote === null ? "Nova Nota" : "Nota");

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)]">
        <div className="mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Minhas Notas
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
          <div className="lg:hidden col-span-1 grid grid-cols-2 gap-4">
            <Sheet open={showNotebookSheet} onOpenChange={setShowNotebookSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="justify-start truncate">
                  <BookOpen className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">{selectedNotebookName}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Cadernos</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto p-1 mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="space-y-1">
                        {notebooks.map((notebook) => (
                          <div
                            key={notebook.id}
                            className="flex items-center gap-2"
                          >
                            <button
                              onClick={() =>
                                toggleNotebookFavorite(notebook.id)
                              }
                              disabled={
                                notebook.id === "all" ||
                                togglingFavoriteNotebooks.has(notebook.id)
                              }
                              className={`shrink-0 text-muted-foreground transition-colors ${
                                notebook.id !== "all"
                                  ? "hover:text-[#F6A800]"
                                  : "cursor-default"
                              }`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  favoriteNotebooks.includes(notebook.id)
                                    ? "fill-[#F6A800] text-[#F6A800]"
                                    : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNotebook(notebook.id);
                                setShowNotebookSheet(false);
                              }}
                              className={`flex-1 text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                                selectedNotebook === notebook.id
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">
                                  {notebook.name}
                                </span>
                              </div>
                            </button>
                            {notebook.id !== "all" &&
                              notebook.name !== "Capturas Rápidas" && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setNotebookToRename(notebook.id);
                                        setRenameNotebookValue(notebook.name);
                                        setShowRenameNotebookModal(true);
                                      }}
                                    >
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Renomear
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setNotebookToDelete(notebook.id);
                                        setShowDeleteNotebookDialog(true);
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
                      <h2 className="font-semibold mb-3 text-sm sm:text-base">
                        Templates
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs sm:text-sm"
                        onClick={() => router.push("/templates")}
                      >
                        Gerenciar Templates
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={showNoteSheet} onOpenChange={setShowNoteSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="justify-start truncate">
                  <FileText className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">{selectedNoteTitle}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Notas</SheetTitle>
                </SheetHeader>
                <div className="p-1 mt-4 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                    onClick={handleAddNewNote}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Nota
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 mt-4">
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
                            disabled={togglingFavoriteNotes.has(note.id)}
                            className="shrink-0 mt-1 text-muted-foreground hover:text-[#F6A800] transition-colors"
                          >
                            <Star
                              className={`h-4 w-4 ${
                                favoriteNotes.includes(note.id)
                                  ? "fill-[#F6A800] text-[#F6A800]"
                                  : ""
                              }`}
                            />
                          </button>
                          <div
                            onClick={() => {
                              setSelectedNote(note.id);
                              setShowNoteSheet(false);
                            }}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-xs sm:text-sm">
                                {note.title}
                              </h3>
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
                                        .filter(
                                          (nb) =>
                                            nb.id !== "all" &&
                                            nb.id !== note.notebook_id
                                        )
                                        .map((notebook) => (
                                          <DropdownMenuItem
                                            key={notebook.id}
                                            disabled={isMovingNote}
                                            onClick={() => {
                                              setNoteToMove(note.id);
                                              handleMoveNote(notebook.id);
                                            }}
                                          >
                                            {notebook.name}
                                          </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedNote(note.id);
                                      setShowDeleteNoteDialog(true);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Apagar Nota
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {note.content}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {note.tags &&
                                note.tags.map((tag, tagIndex) => (
                                  <Badge
                                    key={tag.id}
                                    className={`text-xs ${getTagColor(
                                      tagIndex
                                    )}`}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Column 1: Notebooks (Cadernos) - Hidden on mobile */}
          <div className="hidden lg:flex flex-col lg:col-span-3 bg-card rounded-lg border p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold mb-3 text-sm sm:text-base">
                  Cadernos
                </h2>
                <div className="space-y-1">
                  {notebooks.map((notebook) => (
                    <div key={notebook.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNotebookFavorite(notebook.id)}
                        disabled={
                          notebook.id === "all" ||
                          togglingFavoriteNotebooks.has(notebook.id)
                        }
                        className={`shrink-0 text-muted-foreground transition-colors ${
                          notebook.id !== "all"
                            ? "hover:text-[#F6A800]"
                            : "cursor-default"
                        }`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favoriteNotebooks.includes(notebook.id)
                              ? "fill-[#F6A800] text-[#F6A800]"
                              : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedNotebook(notebook.id)}
                        className={`flex-1 text-left px-3 py-2 rounded-md text-xs sm:text-sm transition-colors ${
                          selectedNotebook === notebook.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{notebook.name}</span>
                        </div>
                      </button>
                      {notebook.id !== "all" &&
                        notebook.name !== "Capturas Rápidas" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setNotebookToRename(notebook.id);
                                  setRenameNotebookValue(notebook.name);
                                  setShowRenameNotebookModal(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Renomear
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setNotebookToDelete(notebook.id);
                                  setShowDeleteNotebookDialog(true);
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
                <h2 className="font-semibold mb-3 text-sm sm:text-base">
                  Templates
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={() => router.push("/templates")}
                >
                  Gerenciar Templates
                </Button>
              </div>
            </div>
          </div>

          {/* Column 2: Notes List - Hidden on mobile */}
          <div className="hidden lg:flex flex-col lg:col-span-4 bg-card rounded-lg border overflow-hidden">
            <div className="p-2 border-b">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs sm:text-sm"
                onClick={handleAddNewNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota
              </Button>
            </div>
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
                        disabled={togglingFavoriteNotes.has(note.id)}
                        className="shrink-0 mt-1 text-muted-foreground hover:text-[#F6A800] transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favoriteNotes.includes(note.id)
                              ? "fill-[#F6A800] text-[#F6A800]"
                              : ""
                          }`}
                        />
                      </button>
                      <div
                        onClick={() => setSelectedNote(note.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xs sm:text-sm">
                            {note.title}
                          </h3>
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
                                    .filter(
                                      (nb) =>
                                        nb.id !== "all" &&
                                        nb.id !== note.notebook_id
                                    )
                                    .map((notebook) => (
                                      <DropdownMenuItem
                                        key={notebook.id}
                                        disabled={isMovingNote}
                                        onClick={() => {
                                          setNoteToMove(note.id);
                                          handleMoveNote(notebook.id);
                                        }}
                                      >
                                        {notebook.name}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedNote(note.id);
                                  setShowDeleteNoteDialog(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Apagar Nota
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.tags &&
                            note.tags.map((tag, tagIndex) => (
                              <Badge
                                key={tag.id}
                                className={`text-xs ${getTagColor(tagIndex)}`}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Note Editor - Spans full width on mobile */}
          <div className="col-span-1 lg:col-span-5 bg-card rounded-lg border overflow-hidden flex flex-col">
            <Tabs
              defaultValue="edit"
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-3 sm:p-4 border-b space-y-3 sm:space-y-4">
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="text-base sm:text-lg font-semibold border-0 px-0 focus-visible:ring-0"
                  placeholder={
                    selectedNote === null
                      ? "Dê um título para sua nova nota..."
                      : "Título da Nota"
                  }
                  disabled={isLoadingNoteContent}
                />

                {selectedNote !== null && !isLoadingNoteContent && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {noteTags.map((tag, index) => (
                      <Badge
                        key={tag.id}
                        className={`cursor-pointer text-xs ${getTagColor(
                          index
                        )}`}
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    <Popover
                      open={showTagSuggestions}
                      onOpenChange={setShowTagSuggestions}
                    >
                      <PopoverAnchor asChild>
                        <div className="flex items-center gap-2 relative">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleAddTag()
                            }
                            placeholder={
                              isTagLoading ? "Adicionando..." : "nova tag"
                            }
                            className="h-7 w-20 sm:w-24 text-xs"
                            disabled={isTagLoading}
                            autoComplete="off"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleAddTag}
                            disabled={isTagLoading}
                          >
                            {isTagLoading ? (
                              <Spinner className="h-3 w-3" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </PopoverAnchor>
                      <PopoverContent
                        className="w-[150px] p-1"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className="max-h-48 overflow-y-auto">
                          {tagSuggestions.map((tag) => (
                            <button
                              key={tag.id}
                              className="w-full text-left p-2 text-xs rounded-sm hover:bg-accent"
                              onClick={() => handleAssociateTag(tag)}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

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

                  <TabsContent value="edit" className="m-0 p-0">
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
                  </TabsContent>
                  <TabsContent value="view" className="m-0 p-0"></TabsContent>
                </div>
              </div>

              <TabsContent
                value="edit"
                className="flex-1 overflow-y-auto min-h-0 focus-visible:ring-0 focus-visible:outline-none"
              >
                <div className="p-3 sm:p-4 h-full">
                  {isLoadingNoteContent ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : (
                    <Textarea
                      ref={textareaRef}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="h-full min-h-[300px] sm:min-h-full border-0 focus-visible:ring-0 resize-none font-mono text-xs sm:text-sm p-0"
                      placeholder="Comece a escrever aqui..."
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="view"
                className="flex-1 overflow-y-auto min-h-0 focus-visible:ring-0 focus-visible:outline-none"
              >
                <div className="p-3 sm:p-4">
                  {isLoadingNoteContent ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : noteContent.trim() ? (
                    <div className="markdown-preview">
                      <ReactMarkdown>{noteContent}</ReactMarkdown>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                      disabled={selectedNote === null}
                    >
                      <MoreVertical className="h-4 w-4 mr-2" />
                      Mais Opções
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        let targetId = selectedNotebook;
                        if (targetId === "all") {
                          const qcNotebook = notebooks.find(
                            (nb) => nb.name === "Capturas Rápidas"
                          );
                          if (qcNotebook) {
                            targetId = qcNotebook.id;
                          } else {
                            toast.error(
                              "Erro: Caderno 'Capturas Rápidas' não encontrado."
                            );
                            return;
                          }
                        }
                        if (targetId) {
                          setNotebookIdForTemplate(targetId);
                          setShowTemplateModal(true);
                        } else {
                          toast.error(
                            "Por favor, selecione um caderno primeiro."
                          );
                        }
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Novo do Template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCreateTemplateFromNote}
                      disabled={selectedNote === null}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Template desta Nota
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  className="w-full sm:w-auto sm:ml-auto text-xs sm:text-sm"
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                >
                  {isSavingNote && <Spinner className="mr-2" />}
                  {isSavingNote ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog
        open={showNewNotebookModal}
        onOpenChange={setShowNewNotebookModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Caderno</DialogTitle>
            <DialogDescription>
              Digite um nome para o novo caderno.
            </DialogDescription>
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
            <Button
              variant="outline"
              onClick={() => setShowNewNotebookModal(false)}
              disabled={isCreatingNotebook}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNotebook}
              disabled={isCreatingNotebook}
            >
              {isCreatingNotebook && <Spinner className="mr-2" />}
              {isCreatingNotebook ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showRenameNotebookModal}
        onOpenChange={setShowRenameNotebookModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Caderno</DialogTitle>
            <DialogDescription>
              Digite o novo nome para o caderno.
            </DialogDescription>
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
            <Button
              variant="outline"
              onClick={() => setShowRenameNotebookModal(false)}
              disabled={isRenamingNotebook}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRenameNotebook}
              disabled={isRenamingNotebook}
            >
              {isRenamingNotebook && <Spinner className="mr-2" />}
              {isRenamingNotebook ? "Renomeando..." : "Renomear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notebookIdForTemplate && (
        <TemplateSelectionModal
          open={showTemplateModal}
          onOpenChange={setShowTemplateModal}
          targetNotebookId={notebookIdForTemplate}
        />
      )}

      <Dialog
        open={showCreateTemplateModal}
        onOpenChange={(open) => {
          if (!open) setNewTemplateName("");
          setShowCreateTemplateModal(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Template desta Nota</DialogTitle>
            <DialogDescription>
              O conteúdo da nota atual será salvo como um template reutilizável.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Nome do Template:</Label>
              <Input
                id="template-title"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                disabled={isCreatingTemplate}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateTemplateModal(false)}
              disabled={isCreatingTemplate}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCreateTemplate}
              disabled={isCreatingTemplate}
            >
              {isCreatingTemplate ? <Spinner className="mr-2" /> : null}
              {isCreatingTemplate ? "Criando..." : "Criar Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={showDeleteNoteDialog}
        onOpenChange={setShowDeleteNoteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar esta nota? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingNote}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNote}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeletingNote}
            >
              {isDeletingNote && <Spinner className="mr-2" />}
              {isDeletingNote ? "Apagando..." : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteNotebookDialog}
        onOpenChange={setShowDeleteNotebookDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar Caderno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar este caderno? Esta ação não pode ser
              desfeita e **todas as notas dentro dele serão apagadas**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingNotebook}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNotebook}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeletingNotebook}
            >
              {isDeletingNotebook && <Spinner className="mr-2" />}
              {isDeletingNotebook ? "Apagar" : "Apagar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
