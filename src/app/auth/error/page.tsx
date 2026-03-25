import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d0e14]">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Ошибка авторизации</h1>
        <p className="mb-6 text-[#8b8fa3]">Не удалось войти. Попробуйте ещё раз.</p>
        <Link
          href="/"
          className="rounded-lg bg-[#3b7fc4] px-6 py-2 text-white transition hover:bg-[#4a8fd4]"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
