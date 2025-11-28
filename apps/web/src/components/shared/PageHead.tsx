import { useEffect } from "react"

interface PageHeadProps {
  title?: string
  description?: string
}

export function PageHead({
  title = "Gen AI Starter",
  description = "Le SaaS Starter Kit ultime pour vos projets IA.",
}: PageHeadProps) {
  const fullTitle =
    title === "Gen AI Starter" ? title : `${title} | Starter Kit`

  useEffect(() => {
    // 1. On change le titre du document (l'onglet)
    document.title = fullTitle

    // 2. On change la meta description (pour le SEO)
    // On cherche si la balise existe déjà pour ne pas la dupliquer
    let metaDescription = document.querySelector("meta[name='description']")
    if (!metaDescription) {
      metaDescription = document.createElement("meta")
      metaDescription.setAttribute("name", "description")
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute("content", description)

    // Cleanup : Optionnel, on pourrait remettre le titre par défaut en quittant
  }, [fullTitle, description])

  // Ce composant ne rend rien visuellement, il fait juste du "Side Effect"
  return null
}
