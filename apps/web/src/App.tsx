import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import LandingPage from "./pages/landing"
import DashboardPage from "./pages/dashboard"
import GeneratorPage from "./pages/generator"
import DashboardLayout from "./layouts/DashboardLayout" // <--- Import du Layout
import { authClient } from "./lib/auth-client"
import { Toaster } from "sonner"

export default function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending)
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Chargement...
      </div>
    )

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />

      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />

        {/* --- ROUTES PRIVÉES (DASHBOARD) --- */}
        {/* 
            C'est ICI que la magie opère. 
            On dit : "Pour toutes les routes à l'intérieur, utilise d'abord DashboardLayout".
            Le Layout affichera la Sidebar, puis injectera la page enfant dans <Outlet />.
        */}
        {session ? (
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/generator" element={<GeneratorPage />} />
          </Route>
        ) : (
          // Sécurité : Redirection si non connecté
          <Route path="/dashboard/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
