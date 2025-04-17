import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const hasAtSymbol = search.includes('@');

    // Only perform search if @ symbol is present (email search)
    if (!hasAtSymbol) {
      // Return empty array if no @ symbol
      return NextResponse.json([]);
    }

    // Find users that match the email search term, excluding the current user
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } }, // Exclude current user
          { email: { contains: search, mode: "insensitive" } }, // Only search by email
        ],
        // Only include active users
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10, // Limit results to 10 users
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 