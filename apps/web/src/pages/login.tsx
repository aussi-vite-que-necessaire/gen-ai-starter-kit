import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (ctx) => alert(ctx.error.message),
      }
    )
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 border p-8">
        <h1 className="text-xl font-semibold text-center">Connexion</h1>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full border px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full border border-black bg-black text-white px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </button>
        </div>
        <div className="text-center text-sm">
          Pas de compte ?{" "}
          <Link to="/register" className="underline">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  )
}
