// Next.js App Router metadata route → served at /manifest.webmanifest
export default function manifest() {
    return {
        name: "Classerize — Unified Learning Dashboard",
        short_name: "Classerize",
        description: "All your courses, assignments, grades, and flashcards in one place.",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#f3f4f6",
        theme_color: "#2563eb",
        orientation: "portrait",
        icons: [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
    };
}
