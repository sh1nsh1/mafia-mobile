import Link from 'next/link';
import { Button } from '@/shared/components';

const linkToLogin = <Link href="/login" />;
const linkToRegister = <Link href="/register" />;

export default function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <main className="w-75 text-center">
        <h1 className="mb-10 font-medium">Мафия</h1>

        <div className="flex justify-center gap-2">
          <Button render={linkToLogin} nativeButton={false}>
            Вход
          </Button>
          <Button render={linkToRegister} nativeButton={false}>
            Регистрация
          </Button>
        </div>
      </main>
    </div>
  );
}
