import axios from "axios"

// 1. On récupère la racine (http://localhost:3000)
const rootUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const api = axios.create({
  // 2. On CONSTRUIT l'URL finale en ajoutant /api
  baseURL: `${rootUrl}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
