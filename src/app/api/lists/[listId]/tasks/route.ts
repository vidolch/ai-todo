import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = params;
    const { targetListId } = await req.json();

    // Verify source list ownership
    const sourceList = await prisma.list.findUnique({
      where: {
        id: listId,
        userId: session.user.id,
      },
    });

    if (!sourceList) {
      return new NextResponse("Source list not found", { status: 404 });
    }

    // Verify target list ownership
    const targetList = await prisma.list.findUnique({
      where: {
        id: targetListId,
        userId: session.user.id,
      },
    });

    if (!targetList) {
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
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = params;

    // Verify list ownership
    const list = await prisma.list.findUnique({
      where: {
        id: listId,
        userId: session.user.id,
      },
    });

    if (!list) {
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