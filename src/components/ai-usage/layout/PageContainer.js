// Shared page shell: consistent max width, padding, and an optional heading block.
export default function PageContainer({ title, subtitle, actions, children }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {(title || actions) && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-content-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
