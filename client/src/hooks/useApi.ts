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
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (body?: any) => {
      setError(null);

      try {
        const response = await api({
          method,
          url,
          data: body,
          ...config,
        });

        await schema.parseAsync(response.data).then(setData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    },
    [url, method, schema, config],
  );

  return { data, error, execute };
}
