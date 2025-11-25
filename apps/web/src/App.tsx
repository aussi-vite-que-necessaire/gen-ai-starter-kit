import { useState } from "react"
import { authClient } from "./lib/auth-client"
import "./App.css"

export default function App() {
  // Hook magique qui récupère la session et l'état de chargement
  const { data: session, isPending } = authClient.useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoginView, setIsLoginView] = useState(true)

  // Gestion Inscription
  const handleSignUp = async () => {
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: () => console.log("Sign up starting..."),
        onSuccess: () => console.log("Sign up success!"),
        onError: (ctx) => alert(ctx.error.message),
      }
    )
  }

  // Gestion Connexion
  const handleSignIn = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => console.log("Sign in success!"),
        onError: (ctx) => alert(ctx.error.message),
      }
    )
  }

  // Gestion Déconnexion
  const handleSignOut = async () => {
    await authClient.signOut()
  }

  if (isPending) return <div className="card">Chargement de la session...</div>

  // --- VUE UTILISATEUR CONNECTÉ ---
  if (session) {
    return (
      <div className="card">
        <h1>Bienvenue, {session.user.name} ! 👋</h1>
        <p>Email: {session.user.email}</p>
        <p>ID: {session.user.id}</p>

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#333",
            borderRadius: "8px",
          }}
        >
          <code>Session active via Secure Cookie 🍪</code>
        </div>

        <button
          onClick={handleSignOut}
          style={{ marginTop: "20px", background: "#ef4444" }}
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  // --- VUE LOGIN / REGISTER ---
  return (
    <div className="card">
      <h1>{isLoginView ? "Connexion" : "Inscription"} 🔐</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "300px",
          margin: "0 auto",
        }}
      >
        {!isLoginView && (
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "10px" }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px" }}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px" }}
        />

        <button onClick={isLoginView ? handleSignIn : handleSignUp}>
          {isLoginView ? "Se connecter" : "S'inscrire"}
        </button>

        <p
          style={{
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "0.9em",
          }}
          onClick={() => setIsLoginView(!isLoginView)}
        >
          {isLoginView
            ? "Pas de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </p>
      </div>
    </div>
  )
}
