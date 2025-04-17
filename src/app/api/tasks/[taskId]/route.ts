import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { taskId } = await params;
    const body = await request.json();
    const { title, description, dueDate, listId, tags, severity, completed, parentId } = body;

    // First, get the current task with list information
    const currentTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      select: {
        userId: true,
        parentId: true,
        listId: true,
        completed: true,
      },
    });

    if (!currentTask) {
      return new NextResponse("Task not found", { status: 404 });
    }

    const isTaskOwner = currentTask.userId === session.user.id;
    
    // Check if this is just a completion status update
    const isCompletionUpdate = Object.keys(body).length === 1 && completed !== undefined;
    
    // Check list access if it's not the owner's task but trying to change completion
    let hasListAccess = false;
    if (!isTaskOwner && currentTask.listId && isCompletionUpdate) {
      // Check if the current user has any tasks in this list (indicating they have access)
      // or if they have collaboration rights on the list
      const userTasksInList = await prisma.task.findFirst({
        where: {
          userId: session.user.id,
          listId: currentTask.listId
        }
      });
      
      // Check if user is a collaborator on the list
      const listCollaborator = await prisma.list.findFirst({
        where: {
          id: currentTask.listId,
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      });
      
      hasListAccess = !!userTasksInList || !!listCollaborator;
    }

    // If not the owner and not just updating completion or doesn't have list access
    if (!isTaskOwner && (!isCompletionUpdate || !hasListAccess)) {
      return new NextResponse("Unauthorized to modify this task", { status: 403 });
    }

    // For owners, allow full update
    // For non-owners with list access, only allow completion status update
    const updateData = isTaskOwner ? {
      title,
      description,
      severity: severity || "normal",
      dueDate: dueDate ? new Date(dueDate) : null,
      completed,
      listId,
      parentId: parentId !== undefined ? parentId : currentTask.parentId,
      tags: {
        set: tags?.map((tagId: string) => ({ id: tagId })),
      },
    } : {
      completed
    };

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
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
    console.error("Error updating task:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
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