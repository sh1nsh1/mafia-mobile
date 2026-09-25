const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/** Возвращает полный URL */
export function url(input: `/${string}`): string {
  return `${baseUrl}${input}`;
}
