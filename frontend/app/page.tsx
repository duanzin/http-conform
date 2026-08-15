export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-6 px-6 py-12">
      <main className="space-y-4">
        <h1 className="text-3xl font-semibold">HTTP Conformance Monitor</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Weekend 1 foundation is ready: Next.js frontend, Spring Boot backend,
          PostgreSQL schema migration, and a health endpoint.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Frontend: Next.js + TypeScript + Tailwind</li>
          <li>Backend health endpoint: <code>/api/health</code></li>
          <li>Database migrations: Flyway V1 initial schema</li>
          <li>Compose stack: frontend, backend, and PostgreSQL</li>
        </ul>
      </main>
    </div>
  );
}
