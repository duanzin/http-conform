import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-12">
      <main className="space-y-4">
        <h1 className="text-3xl font-semibold">HTTP Conformance Monitor</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          A simple HTTP conformance monitor built with Next.js, Spring Boot, and PostgreSQL.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Frontend: Next.js + TypeScript + Tailwind</li>
          <li>Backend: Spring Boot</li>
          <li>Database: PostgreSQL</li>
          <li>Backend health endpoint: <code>/api/health</code></li>
          <li>Database migrations: Flyway V1 initial schema</li>
          <li>Compose stack: frontend, backend, and PostgreSQL</li>
        </ul>
        <Link
          href="/monitors"
          className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Open monitor dashboard
        </Link>
      </main>
    </div>
  );
}
