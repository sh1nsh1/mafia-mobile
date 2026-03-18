import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { router } from "expo-router";
import { Credentials } from "./credentials";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false,
  timeout: 1000,
  // validateStatus: status => status < 300,
});

// Добавляет Access Token при запросах
api.interceptors.request.use(config => {
  const authStore = useAuthStore.getState();
  const token = authStore.credentials?.accessToken;

  if (token) {
    console.log("Добавляю токен к запросу...");
    console.log(token);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  res => res,
  async error => {
    // Access Token протух
    if (error.response?.status === 401) {
      console.log("Токен протух! Обновляю...");
      // Рефреш токена
      await useAuthStore.getState().refreshCredentials();
      // Повтор запроса
      return api(error.config);
    }

    // Refresh Token протух
    if (error.response?.status === 491) {
      console.log(
        "Токен для обновления другого токена тоже протух! Нужно залогиниться!",
      );

      router.replace("/login");
      useAuthStore.setState({ credentials: null });

      return Credentials.removeFromStore();
    }

    return Promise.reject(error);
  },
);
