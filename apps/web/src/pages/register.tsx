import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { useNavigate, Link } from "react-router-dom"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    await authClient.signUp.email(
      { email, password, name },
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
        <h1 className="text-xl font-semibold text-center">Inscription</h1>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nom"
            className="w-full border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            onClick={handleRegister}
            disabled={loading}
            className="w-full border border-black bg-black text-white px-3 py-2 text-sm hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            S'inscrire
          </button>
        </div>
        <div className="text-center text-sm">
          Déjà un compte ?{" "}
          <Link to="/login" className="underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
