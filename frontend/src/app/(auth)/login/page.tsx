import Link from 'next/link';
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-medium">Вход</h1>
      <LoginForm />
      <div className="self-center text-sm">
        Нет аккаунта?{' '}
        <Link href="/register" className="font-bold">
          Зарегистрироваться
        </Link>
      </div>
    </main>
  );
}
