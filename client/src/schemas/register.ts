import * as z from "zod";

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerSchema = z
  .object({
    email: z.email("Тут должна быть почта"),
    name: z
      .string("Имя сюда напиши")
      .min(2, "Имя должно быть минимум 2 символа")
      .max(24, "Имя слишком длинное"),
    password: z
      .string("Пароль сюда напиши")
      .min(8, "Пароль минимум 8 символов")
      .regex(
        /^(?=.*[a-zа-яё])(?=.*[A-ZА-ЯЁ])(?=.*\d)/,
        "Пароль должен содержать буквы разного регистра и цифры",
      )
      .max(128, "Слишком длинный пароль"),
    passwordRepeat: z.string("Повтори пароль"),
  })
  .refine(data => data.password === data.passwordRepeat, {
    message: "Пароли не совпадают",
    path: ["passwordRepeat"],
  });
