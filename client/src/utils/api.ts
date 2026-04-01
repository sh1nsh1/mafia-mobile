import axios, {
  AxiosResponse,
  InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import { AUTHORITY } from "./config";
import { tokensAtom } from "@/atoms/jwt-tokens";
import { RESET } from "jotai/utils";
import { jwtTokensSchema } from "@/schemas/jwt-tokens";
import { store } from "@/atoms/store";

type ErrorData = {
  detail: string[];
};

export const api = axios.create({
  baseURL: `http://${AUTHORITY}`,
  withCredentials: false,
  timeout: 1000,
});

// Добавляет Access Token при запросах
api.interceptors.request.use(config => {
  if (config.url !== "/user/login" && config.url !== "/user/register") {
    const jwtTokens = store.get(tokensAtom);

    if (jwtTokens) {
      console.log(`Добавляю токен к запросу на ${config.url}`);
      config.headers.Authorization = `Bearer ${jwtTokens.accessToken}`;
    } else {
      console.log("Нету токенов");
    }
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (!isAxiosError(error)) {
      console.error("Not axios error:", error);
      return Promise.reject(error);
    }

    if (!error.config) {
      console.error("AxiosError without config: ", error.message);
      return Promise.reject(error.message);
    }

    const { config, request, response } = error;

    if (response) {
      return handleResponseError(response, config);
    }

    if (request) {
      console.error(error.message);
    }

    return Promise.reject(error.message);
  },
);

async function handleResponseError(
  response: AxiosResponse<ErrorData, any>,
  config: InternalAxiosRequestConfig<any>,
) {
  // Access Token протух
  if (response.status === 401) {
    console.log("Токен протух! Обновляю...");

    // Рефреш токена
    const refreshToken = store.get(tokensAtom)?.refreshToken;

    if (!refreshToken) {
      throw new Error("refresh нету");
    }

    await api
      .post("/user/refresh", {
        refreshToken,
      })
      .then(response => jwtTokensSchema.parseAsync(response.data))
      .then(tokens => store.set(tokensAtom, tokens));

    // Повтор запроса
    return api(config);
  }

  // Refresh Token протух
  if (response.status === 491 && config.url?.includes("refresh")) {
    console.log(
      "Токен для обновления другого токена тоже протух! Нужно залогиниться!",
    );

    store.set(tokensAtom, RESET);
  }

  const details = response.data.detail;
  console.error(details);
  return Promise.reject(details);
}
