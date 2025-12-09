import { Geist, Geist_Mono } from "next/font/google";
import AnimatedBackground from "@/components/common/AnimatedBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Agent Platform V2",
  description: "AI Agent Platform for creative workflows",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
