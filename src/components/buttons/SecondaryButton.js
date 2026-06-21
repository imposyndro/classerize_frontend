export default function SecondaryButton({ children, onClick, type = "button", disabled = false, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
