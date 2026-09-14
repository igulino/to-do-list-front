import { apiUrl } from './api'

export interface User {
  id: string
  name: string
  email: string
}

interface Credentials {
  email: string
  password: string
}

async function authenticate(path: string, data: Credentials & { name?: string }): Promise<User> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    })
    const result = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(result?.message || 'Não foi possível continuar. Tente novamente.')
    }

    if (!result?.user?.id) {
      throw new Error('Não foi possível confirmar sua conta. Tente novamente.')
    }

    return result.user as User
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('A conexão demorou um pouco. Tente novamente em instantes.', { cause: error })
    }
    if (error instanceof TypeError) {
      throw new Error('Não conseguimos conectar. Confira sua conexão e tente novamente.', { cause: error })
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export const login = (credentials: Credentials) => authenticate('/api/auth/login', credentials)
export const register = (data: Credentials & { name: string }) => authenticate('/api/auth/register', data)
