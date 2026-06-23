export default function SecondaryButton({ children, onClick, type = "button", disabled = false, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`border border-line text-ink-soft px-4 py-2 rounded-lg text-sm font-medium hover:bg-subtle transition disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
