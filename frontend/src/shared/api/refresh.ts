import { url } from './url';

let tokensPromise: Promise<string> | null = null;
let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

/** Возвращает AccessToken */
export async function refreshTokens(): Promise<string> {
  if (tokensPromise !== null) return tokensPromise;

  tokensPromise = (async () => {
    try {
      const response = await fetch(url('/user/refresh'), {
        method: 'POST',
        credentials: 'include', // refresh-токен в httpOnly cookie
      });

      if (!response.ok) {
        accessToken = null;
        // здесь можно редиректить на /login
        throw new Error('Refresh failed');
      }

      const data = await response.json();
      accessToken = data.accessToken;

      return data.accessToken as string;
    } finally {
      tokensPromise = null;
    }
  })();

  return tokensPromise;
}
