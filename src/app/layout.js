import localFont from "next/font/local";
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import FocusTimer from "@/components/timer/FocusTimer";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <FocusTimer />
        </AuthProvider>
      </body>
    </html>
  );
}
