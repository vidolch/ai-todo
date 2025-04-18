import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tags: true,
        parent: true,
        subtasks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, description, dueDate, listId, tags, severity, parentId } = body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        severity: severity || "normal",
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false,
        userId: session.user.id,
        listId,
        parentId,
        tags: {
          connect: tags?.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
        parent: true,
        subtasks: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 