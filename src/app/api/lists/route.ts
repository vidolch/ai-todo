import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lists = await prisma.list.findMany({
      where: {
        users: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        users: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error("[LISTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, color, invitedUsers } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create users array for the list, always including the current user as OWNER
    const userConnections = [
      {
        userId: session.user.id,
        role: "OWNER"
      }
    ];

    // Add invited users if any
    if (invitedUsers && Array.isArray(invitedUsers) && invitedUsers.length > 0) {
      // Validate each invited user exists before adding
      for (const invited of invitedUsers) {
        const user = await prisma.user.findUnique({
          where: { id: invited.userId }
        });
        
        if (user) {
          // Don't add the current user twice (they're already added as OWNER)
          if (invited.userId !== session.user.id) {
            userConnections.push({
              userId: invited.userId,
              role: invited.role
            });
          }
        }
      }
    }

    const list = await prisma.list.create({
      data: {
        name,
        description,
        color,
        users: {
          create: userConnections
        }
      },
      include: {
        users: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("[LISTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 