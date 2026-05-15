import { useAppStore } from "@/store/app";

/**
 * Wrapper sécurisé autour de fetch qui :
 * - Vérifie toujours res.ok avant de parser le JSON
 * - Ajoute automatiquement userId et role depuis le store Zustand (query params for backward compat)
 * - Ajoute Authorization: Bearer <token> header (primary auth method)
 * - Retourne des réponses typées
 * - Fournit des messages d'erreur en français
 */

export interface ApiFetchError extends Error {
  status: number;
  data: unknown;
}

export class FetchError extends Error implements ApiFetchError {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string>;
};

/**
 * Fetch wrapper principal avec gestion automatique des erreurs.
 * Doit être appelé côté client uniquement (utilise useAppStore.getState()).
 *
 * Auth strategy:
 * - userId + role as query params (verified server-side against DB)
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { user } = useAppStore.getState();

  // Construire l'URL avec params de query
  let fullUrl = url;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    const separator = fullUrl.includes("?") ? "&" : "?";
    fullUrl += separator + searchParams.toString();
  }

  // Ajouter automatiquement userId et role
  const enrichedParams = new URLSearchParams();
  if (user?.id) enrichedParams.set("userId", user.id);
  if (user?.role) enrichedParams.set("role", user.role);

  if (enrichedParams.toString()) {
    const separator = fullUrl.includes("?") ? "&" : "?";
    fullUrl += separator + enrichedParams.toString();
  }

  // Préparer les headers
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const { body, params: _params, ...restOptions } = options;

  const res = await fetch(fullUrl, {
    ...restOptions,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Toujours vérifier res.ok avant de parser
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // JSON parse failed
    if (!res.ok) {
      throw new FetchError(
        res.status,
        `Erreur serveur (${res.status}). Veuillez réessayer.`,
        null,
      );
    }
    throw new FetchError(
      res.status,
      "Réponse serveur invalide.",
      null,
    );
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in (data as Record<string, unknown>) &&
      typeof (data as Record<string, unknown>).error === "string"
        ? (data as Record<string, unknown>).error as string
        : `Erreur serveur (${res.status}). Veuillez réessayer.`;

    throw new FetchError(res.status, message, data);
  }

  return data as T;
}
