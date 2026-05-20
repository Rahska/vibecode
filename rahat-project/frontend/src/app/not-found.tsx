import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-10 text-white flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl">🏕️</div>
      <h2 className="text-2xl font-bold">Страница не найдена</h2>
      <p className="text-slate-400 text-center max-w-md">
        Такой страницы нет в ОРБИТА. Вернитесь на главную или откройте каталог мест.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-orange-500 text-black rounded-xl font-semibold hover:bg-orange-400 transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}
