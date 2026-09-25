import * as z from 'zod';
import { loginSchema } from './login';

export type RegisterSchema = z.infer<typeof registerSchema>;

export const registerSchema = loginSchema
  .extend({
    email: z.email('Тут должна быть почта'),
    passwordRepeat: z.string('Повтори пароль'),
  })
  .refine(data => data.password.length !== 0, {
    message: 'Повтори пароль',
    path: ['passwordRepeat'],
  })
  .refine(data => data.password === data.passwordRepeat, {
    message: 'Пароли не совпадают',
    path: ['password', 'passwordRepeat'],
  });
