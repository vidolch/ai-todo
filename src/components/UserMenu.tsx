import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignOutButton } from "./auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserMenuProps {
  email: string;
  name?: string | null;
  image?: string | null;
}

export function UserMenu({ email, name, image }: UserMenuProps) {
  const initials = name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 p-0 overflow-hidden focus-visible:ring-offset-2"
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={image || undefined} alt={name || email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 bg-gray-900/95 border border-white/10">
        <div className="space-y-3">
          <div className="border-b border-white/10 pb-3 flex items-center space-x-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={image || undefined} alt={name || email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              {name && <p className="text-sm font-medium text-white">{name}</p>}
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
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