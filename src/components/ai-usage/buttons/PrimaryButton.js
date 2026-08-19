// Primary action button. Renders a <button> by default, or an <a>/Link via `as`.
export default function PrimaryButton({ as: Tag = "button", className = "", children, ...props }) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-button transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
