import localFont from "next/font/local";
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FocusTimer from "@/components/timer/FocusTimer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Classerize — Your Unified Learning Dashboard",
  description: "Aggregate courses, assignments, and grades from all your institutions in one place.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Classerize",
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
        <AuthProvider>
          {children}
          <FocusTimer />
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
