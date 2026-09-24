import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-center text-3xl font-medium">Вход</h1>
      <LoginForm />
    </div>
  );
}
