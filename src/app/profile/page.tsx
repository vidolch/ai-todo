"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const user = await response.json();
          setName(user.name || "");
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading profile...</div>;
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="bg-white/5 border-white/10 text-white"
          />
          <p className="text-sm text-gray-400">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 text-white hover:bg-blue-500"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
} 