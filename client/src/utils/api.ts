import { useAuthStore } from "@/stores/auth-store";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import { Credentials } from "../entities/credentials";
import { AUTHORITY } from "./config";

type ErrorData = {
  detail: string[];
};

export const api = axios.create({
  baseURL: `http://${AUTHORITY}`,
  withCredentials: false,
  timeout: 1000,
  // validateStatus: status => status < 300,
});

// Добавляет Access Token при запросах
api.interceptors.request.use(config => {
  const authStore = useAuthStore.getState();
  const token = authStore.credentials?.accessToken;

  if (token) {
    console.log(`Добавляю токен к запросу на ${config.url}`);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (!axios.isAxiosError(error)) {
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
  response: AxiosResponse<ErrorData, any, {}>,
  config: InternalAxiosRequestConfig<any>,
) {
  // Access Token протух
  if (response.status === 401) {
    console.log("Токен протух! Обновляю...");

    // Рефреш токена
    await useAuthStore.getState().refreshCredentials();

    // Повтор запроса
    return api(config);
  }

  // Refresh Token протух
  if (response.status === 491 && config.url?.includes("refresh")) {
    console.log(
      "Токен для обновления другого токена тоже протух! Нужно залогиниться!",
    );

    router.replace("/login");
    useAuthStore.setState({ credentials: null });

    return Credentials.removeFromStore();
  }

  const details = response.data.detail;

  console.error(details);
  return Promise.reject(details);
}
