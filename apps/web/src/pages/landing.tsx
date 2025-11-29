import { Link } from "react-router-dom"
import { authClient } from "../lib/auth-client"

export default function LandingPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-semibold">Gen AI Starter Kit</span>
        <div className="flex gap-4">
          {session ? (
            <Link to="/dashboard" className="text-sm hover:underline">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:underline">
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-sm border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-lg">
          <h1 className="text-3xl font-semibold">Gen AI Starter Kit</h1>
          <p className="text-gray-600">
            API + Frontend + n8n workflows. Minimaliste et prêt à l'emploi.
          </p>
          <Link
            to={session ? "/dashboard" : "/register"}
            className="inline-block border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors"
          >
            Commencer
          </Link>
        </div>
      </main>
    </div>
  )
}
