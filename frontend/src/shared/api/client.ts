import { getAccessToken, refreshTokens } from './refresh';

export async function fetchAuthorized(
  input: string | URL | Request,
  init: RequestInit = {},
): Promise<Response> {
  const { headers, ...rest } = init;
  let retry = true;

  const finalHeaders = new Headers(headers);
  const accessToken = getAccessToken();
  if (accessToken) {
    finalHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...rest,
    headers: finalHeaders,
  });

  // Если 401 и это не повторный заход - пробуем refresh
  if (response.status === 401 && retry) {
    try {
      const newToken = await refreshTokens();

      // повторяем исходный запрос с новым токеном
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${newToken}`);

      return fetch(input, {
        ...rest,
        headers: retryHeaders,
      });
    } catch {
      // refresh не удался — отдаём оригинальный 401
      return response;
    }
  }

  return response;
}
