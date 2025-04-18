import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;

    // First, verify the user has access to this list
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: listId
        }
      }
    });

    if (!userList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Fetch all tasks for this list, regardless of which user created them
    const tasks = await prisma.task.findMany({
      where: {
        listId: listId
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
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
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[LIST_TASKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;
    const { targetListId } = await request.json();

    // Verify source list access
    const sourceUserList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: listId,
        },
      },
    });

    if (!sourceUserList) {
      return new NextResponse("Source list not found", { status: 404 });
    }

    // Verify target list access
    const targetUserList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: targetListId,
        },
      },
    });

    if (!targetUserList) {
      return new NextResponse("Target list not found", { status: 404 });
    }

    // Move all tasks to the target list
    await prisma.task.updateMany({
      where: {
        listId,
        userId: session.user.id,
      },
      data: {
        listId: targetListId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASKS_MOVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;

    // Verify list access
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: listId,
        },
      },
    });

    if (!userList) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Delete all tasks in the list
    await prisma.task.deleteMany({
      where: {
        listId,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASKS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 