import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import LandingPage from "./pages/landing"
import DashboardPage from "./pages/dashboard"
import PageCreatePage from "./pages/page-create"
import PageDetailPage from "./pages/page-detail"
import WorkflowPage from "./pages/workflow"
import SettingsPage from "./pages/settings"
import DashboardLayout from "./layouts/DashboardLayout"
import { authClient } from "./lib/auth-client"
import { Toaster } from "sonner"
import { Loader2 } from "lucide-react"
import { ConfirmDialog } from "./components/ui/confirm-dialog"

export default function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
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
            <Route path="/dashboard/pages/create" element={<PageCreatePage />} />
            <Route path="/dashboard/pages/:id" element={<PageDetailPage />} />
            <Route path="/dashboard/workflows/:id" element={<WorkflowPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        ) : (
          <Route path="/dashboard/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}
