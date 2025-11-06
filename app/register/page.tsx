"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import authApi from "@/lib/api/authApi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit =  async (e: React.FormEvent) => {
    e.preventDefault()
    
    if(password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      setIsLoading(false)
      return
    }

    try {
      const response = await authApi.post("/auth/register", {
        full_name: name,
        email: email,
        password: password
      })

      const { access_token } = response.data
      
      localStorage.setItem("token", access_token)
      
      router.push("/dashboard")
    } catch (err: any) {
      if(err.response && err.response.status === 409) {
        setError("Um usuário com esse email já existe")
      } else {
        setError("Ocorreu um erro ao criar a conta. Tente novamente.")
      }
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background Image - Replace src with your image path */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-estrato.jpg')" }}
      >
        {/* Optional overlay for better readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Logo in top-left corner */}
      <div className="absolute top-6 left-6 z-10">
        <img src="/logo-name-white.svg" alt="Estrato Logo" className="h-24 w-24" />
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/95 backdrop-blur-sm rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6 text-center">
            Crie uma nova conta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-center">
                  {error}
                </AlertDescription>
              </Alert>
            )}


            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Insira seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Insira seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Insira sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-10 text-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base">
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? "Criando conta..." : "Cadastrar"}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
            Já possui uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Faça seu Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
