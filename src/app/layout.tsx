import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";

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
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-2xl font-bold text-white">
                      AI TODO
                    </Link>
                    <nav className="flex items-center gap-4">
                      <Link
                        href="/"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Tasks
                      </Link>
                      <Link
                        href="/lists"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Lists
                      </Link>
                    </nav>
                  </div>
                  <UserMenu 
                    email={session.user?.email || ''} 
                    name={session.user?.name}
                    image={session.user?.image}
                  />
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
