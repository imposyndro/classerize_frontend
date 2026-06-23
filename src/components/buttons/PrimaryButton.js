export default function PrimaryButton({ children, onClick, type = "button", disabled = false, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-brand text-brand-fg px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-hover transition disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
