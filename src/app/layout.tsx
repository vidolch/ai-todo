import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI TODO",
  description: "A smart todo application powered by AI",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} dark:bg-gray-900`}>
        <div className="min-h-screen">
          {session && (
            <header className="bg-white/5 border-b border-white/10 shadow-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <Link href="/" className="text-2xl font-bold text-white">
                    AI TODO
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/lists"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Lists
                    </Link>
                    <Link
                      href="/profile"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      Profile
                    </Link>
                    <span className="text-gray-300">
                      Signed in as {session.user?.email}
                    </span>
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </header>
          )}
          {children}
        </div>
      </body>
    </html>
  );
}
