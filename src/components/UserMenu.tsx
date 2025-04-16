import { User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignOutButton } from "./auth/sign-out-button";

interface UserMenuProps {
  email: string;
}

export function UserMenu({ email }: UserMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white transition-colors"
        >
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 bg-gray-900/95 border border-white/10">
        <div className="space-y-3">
          <div className="border-b border-white/10 pb-3">
            <p className="text-sm text-gray-400">Signed in as</p>
            <p className="text-sm font-medium text-white truncate">{email}</p>
          </div>
          <div className="space-y-1">
            <Link
              href="/profile"
              className="block w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              Profile
            </Link>
            <SignOutButton />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 