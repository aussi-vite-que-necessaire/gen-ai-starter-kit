import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import LandingPage from "./pages/landing"
import DashboardPage from "./pages/dashboard"
import GeneratorPage from "./pages/generator"
import SettingsPage from "./pages/settings" // Import
import DashboardLayout from "./layouts/DashboardLayout"
import { authClient } from "./lib/auth-client"
import { Toaster } from "sonner"
import { Loader2 } from "lucide-react"
import { DashboardShell } from "./components/loaders/DashboardShell"
import { ConfirmDialog } from "./components/ui/confirm-dialog"

export default function App() {
  const { data: session, isPending } = authClient.useSession()

  // --- LOGIQUE DE CHARGEMENT INTELLIGENTE ---
  if (isPending) {
    // Si on est sur une route dashboard, on affiche déjà la structure
    // pour éviter l'effet "flash blanc" puis "re-flash layout"
    if (window.location.pathname.startsWith("/dashboard")) {
      return <DashboardShell />
    }

    // Sinon (Login/Home), spinner classique centré
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }
  // -------------------------------------------

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <ConfirmDialog />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />

        {session ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/generator" element={<GeneratorPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        ) : (
          <Route path="/dashboard/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
