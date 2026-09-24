import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="text-center p-4">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Возможно, она была удалена или вы ошиблись в адресе.</p>
      <Link href="/">Вернуться на главную</Link>
    </main>
  );
}
