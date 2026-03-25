import { api } from "@/utils/api";
import { AxiosRequestConfig } from "axios";
import { useCallback } from "react";
import * as z from "zod";

export function useApi<T>(
  url: string,
  schema: z.ZodType<T>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  config?: AxiosRequestConfig,
) {
  const execute = useCallback(
    async (body?: any) => {
      const response = await api({
        method,
        url,
        data: body,
        ...config,
      });

      return schema.parseAsync(response.data);
    },
    [url, method, schema, config],
  );

  return { execute };
}
