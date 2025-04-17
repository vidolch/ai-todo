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

    const { name, description, color } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const list = await prisma.list.create({
      data: {
        name,
        description,
        color,
        users: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        }
      },
      include: {
        users: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
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