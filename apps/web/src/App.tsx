import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import "./App.css"

function App() {
  // Récupération de l'URL depuis le .env
  const API_URL = import.meta.env.VITE_API_URL

  // Utilisation de TanStack Query pour fetcher
  const { data, isLoading, error } = useQuery({
    queryKey: ["hello"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/`)
      return response.data // { message: "Hello..." }
    },
  })

  return (
    <div className="card">
      <h1>Gen AI Starter Kit 🚀</h1>

      <div
        style={{
          padding: "20px",
          border: "1px solid #444",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h2>Status API :</h2>

        {isLoading && <p>Chargement...</p>}

        {error && (
          <p style={{ color: "red" }}>
            Erreur : Impossible de contacter l'API ({API_URL})
          </p>
        )}

        {data && (
          <p
            style={{ color: "#4ade80", fontSize: "1.2em", fontWeight: "bold" }}
          >
            ✅ Réponse : {data.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
