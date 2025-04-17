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

    const { name, description, color, invitedUsers } = await req.json();
    const { listId } = params;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Verify list access and ownership
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: listId,
        },
      },
    });

    if (!userList) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Only owner can update the list
    if (userList.role !== "OWNER") {
      return new NextResponse("Permission denied", { status: 403 });
    }

    // Update basic list information
    const updatedList = await prisma.list.update({
      where: {
        id: listId,
      },
      data: {
        name,
        description,
        color,
      },
    });

    // If invitedUsers is provided, update the user list
    if (invitedUsers && Array.isArray(invitedUsers)) {
      // Get current users for this list
      const currentUsers = await prisma.userList.findMany({
        where: { listId },
        select: { userId: true }
      });
      
      const currentUserIds = currentUsers.map((u: { userId: string }) => u.userId);
      const newUserIds = invitedUsers.map((u: { userId: string }) => u.userId);
      
      // Find users to remove (in current but not in new)
      const usersToRemove = currentUserIds.filter((id: string) => !newUserIds.includes(id) && id !== session.user.id);
      
      // Find users to add (in new but not in current)
      const usersToAdd = invitedUsers.filter((u: { userId: string }) => !currentUserIds.includes(u.userId));
      
      // Find users to update roles
      const usersToUpdate = invitedUsers.filter((u: { userId: string }) => 
        currentUserIds.includes(u.userId) && u.userId !== session.user.id);
      
      // Perform the operations
      
      // 1. Remove users
      if (usersToRemove.length > 0) {
        await prisma.userList.deleteMany({
          where: {
            listId,
            userId: { in: usersToRemove }
          }
        });
      }
      
      // 2. Add new users
      if (usersToAdd.length > 0) {
        await prisma.userList.createMany({
          data: usersToAdd.map(u => ({
            listId,
            userId: u.userId,
            role: u.role
          }))
        });
        
        // Assign existing unassigned tasks to the current user
        await prisma.task.updateMany({
          where: {
            listId,
            userId: {
              isNull: true
            }
          },
          data: {
            userId: session.user.id
          }
        });
      }
      
      // 3. Update roles for existing users
      for (const user of usersToUpdate) {
        await prisma.userList.update({
          where: {
            userId_listId: {
              userId: user.userId,
              listId
            }
          },
          data: {
            role: user.role
          }
        });
      }
    }

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error("[LIST_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = params;

    // Verify list access and ownership
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId: listId,
        },
      },
    });

    if (!userList) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Only owner can delete the list
    if (userList.role !== "OWNER") {
      return new NextResponse("Permission denied", { status: 403 });
    }

    // Delete the list
    await prisma.list.delete({
      where: {
        id: listId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LIST_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 