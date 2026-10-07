import axios from 'axios'

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // 1. Server returned a custom message
    const serverMessage = error.response?.data?.message
    if (serverMessage && typeof serverMessage === 'string') {
      return serverMessage
    }

    const serverError = error.response?.data?.error
    if (serverError && typeof serverError === 'string') {
      return serverError
    }

    // 2. HTTP status-specific friendly messages
    const status = error.response?.status
    switch (status) {
      case 400:
        return 'Requête invalide. Veuillez vérifier les informations saisies.'
      case 401:
        return 'Email ou mot de passe incorrect.'
      case 403:
        return 'Accès refusé. Vous n’avez pas les autorisations nécessaires.'
      case 404:
        return 'La ressource demandée est introuvable.'
      case 409:
        return 'Un enregistrement avec ces informations existe déjà.'
      case 422:
        return 'Données non valides. Veuillez corriger le formulaire.'
      default:
        if (status && status >= 500) {
          return 'Erreur serveur. Veuillez réessayer dans un instant.'
        }
    }

    // 3. Network or connection failure
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Impossible de contacter le serveur. Assurez-vous que le serveur est bien démarré.'
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('401')) {
      return 'Email ou mot de passe incorrect.'
    }
    if (error.message.includes('Network Error')) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.'
    }
    return error.message
  }

  return 'Une erreur inattendue est survenue.'
}
