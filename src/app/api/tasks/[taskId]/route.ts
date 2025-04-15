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

    const body = await request.json();
    const { title, description, dueDate, completed, listId, tags, severity } = body;

    const task = await prisma.task.update({
      where: {
        id: params.taskId,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        severity,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed,
        listId,
        tags: {
          set: [],
          connect: tags?.map((tagId: string) => ({ id: tagId })),
        },
      },
      include: {
        tags: true,
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

    await prisma.task.delete({
      where: {
        id: params.taskId,
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 