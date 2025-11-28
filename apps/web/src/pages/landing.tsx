// apps/web/src/pages/landing.tsx
import { Link } from "react-router-dom"
import { authClient } from "../lib/auth-client"
import { ArrowRight, Bot, CheckCircle } from "lucide-react"

export default function LandingPage() {
  const { data: session } = authClient.useSession()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Simple */}
      <nav className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Bot className="h-6 w-6" />
          <span>Gen AI Starter</span>
        </div>
        <div className="flex gap-4">
          {session ? (
            <Link
              to="/dashboard"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Mon Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Lancez votre SaaS IA <br />
          <span className="text-blue-600">en un temps record.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Une stack moderne, robuste et scalable. React, Node, PostgreSQL et
          Docker. Déjà configuré pour la production.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            to={session ? "/dashboard" : "/register"}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700 transition-all"
          >
            Commencer maintenant <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          {[
            "Authentification Complète",
            "Database & ORM Configuré",
            "Infrastructure Docker Ready",
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-xl border border-gray-200 p-6 bg-gray-50"
            >
              <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
              <h3 className="font-semibold text-gray-900">{feature}</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tout est prêt pour que vous puissiez vous concentrer sur votre
                produit.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
