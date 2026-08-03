const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "")

let csrfToken: string | null = null
let pending: Promise<string> | null = null

export async function getCsrfToken(force = false) {
  if (!force && csrfToken) return csrfToken
  if (!force && pending) return pending
  pending = fetch(`${API_BASE}/auth/csrf`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) throw new Error("Unable to initialize request protection")
    const body = await response.json()
    csrfToken = body.csrfToken
    return csrfToken as string
  }).finally(() => {
    pending = null
  })
  return pending
}

export function clearCsrfToken() {
  csrfToken = null
  pending = null
}
