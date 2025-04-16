import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { title, description, dueDate, listId, tags, severity, completed, parentId } = body;

    // First, get the current task to preserve its parentId if not provided in the update
    const currentTask = await prisma.task.findUnique({
      where: {
        id: taskId,
        userId: session.user.id,
      },
      select: {
        parentId: true,
      },
    });

    const task = await prisma.task.update({
      where: {
        id: taskId,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        severity: severity || "normal",
        dueDate: dueDate ? new Date(dueDate) : null,
        completed,
        listId,
        parentId: parentId !== undefined ? parentId : currentTask?.parentId,
        tags: {
          set: tags?.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
        parent: true,
        subtasks: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = await params;

    await prisma.task.delete({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 