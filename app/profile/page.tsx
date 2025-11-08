"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import authApi from "@/lib/api/authApi";
import api from "@/lib/api/api";

interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [name, setName] = useState("João da Silva");
  const [email, setEmail] = useState("joao@email.com");
  const [originalName, setOriginalName] = useState("João da Silva");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.get<User>("/auth/users/me");

        setName(response.data.full_name);
        setOriginalName(response.data.full_name);
        setEmail(response.data.email);
      } catch (err) {
        console.error("Erro ao buscar usuário: ", err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const user = {
    avatar: "/user-avatar.png",
  };

  const handleSavePersonalInfo = async () => {
    if (name === originalName) {
      setIsEditingPersonalInfo(false);
      return;
    }

    setIsSavingName(true);
    const toastId = toast.loading("Salvando alterações...");

    try {
      const response = await authApi.patch("/auth/users/me", {
        full_name: name,
      });

      toast.success("Nome atualizado com sucesso!", { id: toastId });
      setIsEditingPersonalInfo(false);

      setOriginalName(response.data.full_name);

      location.reload();
    } catch (err) {
      console.error("Erro ao salvar dados pessoais: ", err);
      toast.error("Erro ao salvar. Tente novamente.", { id: toastId });
      setName(originalName);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPersonalInfo(false);
    setName(originalName);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos os campos são obrigatórios.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setIsSavingPassword(true);
    const toastId = toast.loading("Verificando a senha atual...");

    try {
      await authApi.post("/auth/login", {
        email: email,
        password: currentPassword,
      });

      toast.loading("Atualizando para a nova senha...", { id: toastId });

      await authApi.patch("auth/users/me", {
        password: newPassword,
      });

      toast.success("Senha alterada com sucesso!", { id: toastId });
      setShowChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setPasswordError("A senha atual está incorreta.");
        toast.error("A senha atual está incorreta.", { id: toastId });
      } else {
        console.error("Erro ao alterar a senha: ", err);
        setPasswordError("Ocorreu um erro ao alterar a senha.");
        toast.error("Ocorreu um erro ao alterar a senha.", { id: toastId });
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const toastId = toast.loading("Excluindo sua conta...");

    try {
      await api.delete("users/me/data");

      toast.loading("Quase lá... Excluindo sua conta...", { id: toastId });

      await authApi.delete("auth/users/me");
      toast.success("Conta excluída com sucesso. Sentiremos sua falta!", {
        id: toastId,
      });

      localStorage.removeItem("token");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Erro ao excluir a conta: ", err);
      toast.error("Erro ao excluir sua conta. Tente novamente.", {
        id: toastId,
      });
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
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
            <CardTitle className="text-base sm:text-lg">
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-sm">
              Atualize seus dados pessoais
            </CardDescription>
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
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted cursor-not-allowed text-sm"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {isEditingPersonalInfo ? (
                <>
                  <Button
                    onClick={handleSavePersonalInfo}
                    disabled={isSavingName || name === originalName}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    {isSavingName ? <Spinner className="mr-2" /> : null}
                    {isSavingName ? "Salvando..." : "Salvar"}
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
                <Button
                  onClick={() => setIsEditingPersonalInfo(true)}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Alterar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Ações da Conta
            </CardTitle>
            <CardDescription className="text-sm">
              Gerencie sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 text-sm sm:text-base">
                  Alterar Senha
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Atualize sua senha de acesso
                </p>
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
                <h3 className="font-semibold mb-1 text-sm sm:text-base">
                  Excluir Conta
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Remova permanentemente sua conta e dados
                </p>
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
      <Dialog
        open={showChangePasswordModal}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordError(null);
            setIsSavingPassword(false);
          }
          setShowChangePasswordModal(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual:</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha:</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSavingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha:</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSavingPassword}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangePasswordModal(false)}
              disabled={isSavingPassword}
            >
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} disabled={isSavingPassword}>
              {isSavingPassword ? <Spinner className="mr-2" /> : null}
              {isSavingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog
        open={showDeleteAccountModal}
        onOpenChange={setShowDeleteAccountModal}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser
              desfeita e todos os seus dados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? <Spinner className="mr-2" /> : null}
              {isDeletingAccount ? "Excluindo..." : "Excluir Conta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
