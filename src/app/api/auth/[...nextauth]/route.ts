import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const { GET, POST } = NextAuth(authOptions); 