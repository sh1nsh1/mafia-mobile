import * as z from 'zod';
import { loginSchema } from './login';

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerSchema = loginSchema
  .extend({
    email: z.email('Тут должна быть почта').max(65, 'Cлишком длинная почта'),
    passwordRepeat: z.string().min(1, 'Повтори пароль'),
  })
  .refine(data => data.password === data.passwordRepeat, {
    message: 'Пароли не совпадают',
    path: ['passwordRepeat'],
  });
