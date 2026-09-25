import Link from 'next/link';
import { RegisterForm } from '@/features/auth';

export default function RegisterPage() {
  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-medium">Регистрация</h1>
      <RegisterForm />
      <div className="self-center text-sm">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="font-bold">
          Войти
        </Link>
      </div>
    </main>
  );
}
