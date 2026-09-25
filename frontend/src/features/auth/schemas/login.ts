import * as z from 'zod';

export type LoginSchema = z.infer<typeof loginSchema>;

export const loginSchema = z.object({
  name: z
    .string('Тут должно быть имя')
    .min(2, 'Имя должно быть минимум 2 символа')
    .max(24, 'Имя слишком длинное'),
  password: z
    .string('А тут пароль')
    .min(8, 'Пароль должен быть минимум 8 символов')
    .max(128, 'Слишком длинный пароль'),
});
