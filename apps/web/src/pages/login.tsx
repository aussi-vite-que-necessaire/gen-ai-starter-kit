import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { PageHead } from "../components/shared/PageHead"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (ctx) => alert(ctx.error.message),
      }
    )
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <PageHead title="Connexion" />

      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-sm border border-gray-200">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
          <p className="text-sm text-gray-500">
            Entrez vos identifiants pour accéder au kit.
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </button>
        </div>
        <div className="text-center text-sm">
          Pas de compte ?{" "}
          <Link to="/register" className="font-medium underline">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}
