import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">AI TODO</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Signed in as {session.user?.email}</span>
            <SignOutButton />
          </div>
        </div>
        
        <div className="grid gap-4">
          {/* TODO: Add task list and other components here */}
          <p className="text-gray-600">Your tasks will appear here</p>
        </div>
      </div>
    </main>
  );
}
