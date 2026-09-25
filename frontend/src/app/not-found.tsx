import Link from 'next/link';
import { Button } from '@/shared/components';

const linkToMain = <Link href="/" />;

export default function NotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <main className="flex max-w-180 flex-col gap-2">
        <h2 className="mb-1">404 - Страница не найдена</h2>
        <p>
          Похоже, вы свернули не на ту улицу. Этой страницы не существует в нашем
          городе — возможно, её <span className="font-mono font-medium">убрали</span>{' '}
          прошлой ночью, или она никогда не была частью игры.
        </p>
        <p>
          Не стоит кричать и привлекать внимание. Просто вернитесь в центр города,
          пока комиссар не задал лишних вопросов.
        </p>
        <Button render={linkToMain} nativeButton={false} className="self-center">
          Вернуться на главную
        </Button>
      </main>
    </div>
  );
}
