import { api } from "@/utils/api";
import { AxiosRequestConfig } from "axios";
import { useCallback, useState } from "react";
import * as z from "zod";

export function useApi<T>(
  url: string,
  schema: z.ZodType<T>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  config?: AxiosRequestConfig,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (body?: T) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api({
          method,
          url,
          data: body,
          ...config,
        });

        const parsed = await schema.safeParseAsync(response.data);

        if (parsed.success) {
          const data = parsed.data;
          setData(parsed.data);
        } else {
          throw new Error(parsed.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    },
    [url, method, schema, config],
  );

  return { data, loading, error, execute };
}
