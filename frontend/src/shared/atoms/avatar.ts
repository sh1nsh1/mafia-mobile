import { atom } from "jotai";
import { userAtom } from "./user";
import { api } from "@/utils/api";

export const avatarAtom = atom(async get => {
  const user = get(userAtom);

  if (user) {
    const response = await api.get("/user/avatar", {
      responseType: "blob", // Для binary
    });

    const blobUrl = URL.createObjectURL(response.data);

    return blobUrl;
  } else {
    return null;
  }
});
