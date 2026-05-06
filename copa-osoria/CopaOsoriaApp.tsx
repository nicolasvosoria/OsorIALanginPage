"use client"

import { Toaster } from "@/copa-osoria/components/ui/toaster"
import { Toaster as Sonner } from "@/copa-osoria/components/ui/sonner"
import { TooltipProvider } from "@/copa-osoria/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/copa-osoria/contexts/AuthContext"
import { ProtectedRoute } from "@/copa-osoria/components/layout/ProtectedRoute"
import Login from "@/copa-osoria/pages/auth/Login"
import Register from "@/copa-osoria/pages/auth/Register"
import PasswordReset from "@/copa-osoria/pages/auth/PasswordReset"
import ChangePassword from "@/copa-osoria/pages/auth/ChangePassword"
import Predictions from "@/copa-osoria/pages/Predictions"
import Rankings from "@/copa-osoria/pages/Rankings"
import Summary from "@/copa-osoria/pages/Summary"
import Profile from "@/copa-osoria/pages/Profile"
import NotFound from "@/copa-osoria/pages/NotFound"
import VerificarPuntos from "@/copa-osoria/pages/VerificarPuntos"
import GroupsList from "@/copa-osoria/pages/groups/GroupsList"
import GroupDetails from "@/copa-osoria/pages/groups/GroupDetails"
import GroupJoin from "@/copa-osoria/pages/groups/GroupJoin"
import UpcomingMatches from "@/copa-osoria/pages/UpcomingMatches"
import Landing from "@/copa-osoria/pages/Landing"

const queryClient = new QueryClient()

export default function CopaOsoriaApp() {
  return (
    <div className="copa-osoria min-h-screen bg-background text-foreground font-body antialiased">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename="/copa-osoria">
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route path="/password-reset" element={<PasswordReset />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/verificar-puntos" element={<VerificarPuntos />} />
                  <Route path="/predicciones" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
                  <Route path="/proximos-partidos" element={<ProtectedRoute><UpcomingMatches /></ProtectedRoute>} />
                  <Route path="/ranking" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
                  <Route path="/resumen" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
                  <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/grupos" element={<ProtectedRoute><GroupsList /></ProtectedRoute>} />
                  <Route path="/grupos/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
                  <Route path="/grupos/unirse/:id" element={<GroupJoin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  )
}
