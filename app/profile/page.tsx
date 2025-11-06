"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"
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

export default function ProfilePage() {
  const router = useRouter()
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false)
  const [name, setName] = useState("João da Silva")
  const [email, setEmail] = useState("joao@email.com")
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)

  // Mock user data
  const user = {
    avatar: "/placeholder.svg?key=4v563",
  }

  const handleSavePersonalInfo = () => {
    // TODO: Save personal info logic (only name can be changed)
    setIsEditingPersonalInfo(false)
  }

  const handleCancelEdit = () => {
    setIsEditingPersonalInfo(false)
    setName("João da Silva")
  }

  const handleChangePassword = () => {
    // TODO: Change password logic
    setShowChangePasswordModal(false)
  }

  const handleDeleteAccount = () => {
    // TODO: Delete account logic
    setShowDeleteAccountModal(false)
    router.push("/login")
  }

  const handleLogout = () => {
    router.push("/login")
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Avatar */}
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={name} />
            <AvatarFallback className="text-2xl sm:text-3xl">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
            <CardDescription className="text-sm">Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Nome Completo:
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditingPersonalInfo}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email:
              </Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted cursor-not-allowed text-sm" />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {isEditingPersonalInfo ? (
                <>
                  <Button onClick={handleSavePersonalInfo} className="w-full sm:w-auto text-xs sm:text-sm">
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto text-xs sm:text-sm bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditingPersonalInfo(true)} className="w-full sm:w-auto text-xs sm:text-sm">
                  Alterar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Ações da Conta</CardTitle>
            <CardDescription className="text-sm">Gerencie sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Alterar Senha</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Atualize sua senha de acesso</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Alterar
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Excluir Conta</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Remova permanentemente sua conta e dados</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccountModal(true)}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Apagar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive bg-transparent w-full sm:w-auto text-xs sm:text-sm"
          >
            Sair
          </Button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>Digite sua senha atual e a nova senha</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual:</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha:</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha:</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword}>Alterar Senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão
              permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              Excluir Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  )
}
