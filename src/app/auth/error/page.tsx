import Link from 'next/link'

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="mb-4 text-lg font-bold text-[#9e3e2a] crt-glow-molotov">
          {'>'} ОШИБКА АВТОРИЗАЦИИ
        </h1>
        <p className="mb-6 text-xs text-[#444444]">
          // не удалось войти. попробуйте ещё раз.
        </p>
        <Link
          href="/"
          className="px-5 py-2 text-xs font-bold border border-[#2a2a2a] text-[#888888] hover:text-[#cccccc] hover:bg-[#1a1a1a] transition-colors"
        >
          [ НА ГЛАВНУЮ ]
        </Link>
      </div>
    </div>
  )
}
