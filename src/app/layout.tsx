import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { homePath, ticketsPath } from "@/path";

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

export const metadata: Metadata = {
  title: "The Road to Next",
  description: "My road to next application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
           className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="flex justify-between py-2.5 px-5 border-b">
          <div>
            <Link href={homePath()} className={buttonVariants({ variant: "outline"})}>
              Home
            </Link>
          </div>
          <div>
            <Link href={ticketsPath()} className={buttonVariants({ variant: "outline"})}>
              Tickets
            </Link>
          </div>
        </nav>
        <main className="py-24 px-8 min-h-screen flex-1 overflow-y-auto overflow-x-hidden bg-secondary/20 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
