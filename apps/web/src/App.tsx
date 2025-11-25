// apps/web/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import DashboardPage from "./pages/dashboard"
import LandingPage from "./pages/landing"
import { authClient } from "./lib/auth-client"

export default function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Chargement...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Route Publique (Accueil) */}
        <Route path="/" element={<LandingPage />} />

        {/* Routes Auth (Redirigent vers Dashboard si déjà connecté) */}
        <Route
          path="/login"
          element={!session ? <LoginPage /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!session ? <RegisterPage /> : <Navigate to="/dashboard" />}
        />

        {/* Route Protégée (Dashboard) */}
        <Route
          path="/dashboard"
          element={session ? <DashboardPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
