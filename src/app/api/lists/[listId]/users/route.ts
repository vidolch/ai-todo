import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;

    // Verify the user has access to this list
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId,
        },
      },
    });

    if (!userList) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Get all users for this list with their roles
    const listUsers = await prisma.userList.findMany({
      where: {
        listId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const formattedUsers = listUsers.map((item: 
      {
        userId: string;
        role: string;
        user: {
          id: string;
          name: string | null;
          email: string | null;
          image: string | null;
        };
      }
    ) => ({
      userId: item.userId,
      role: item.role,
      user: item.user
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("[LIST_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;
    const { userId, role } = await req.json();

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    if (!["OWNER", "CONTRIBUTOR"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Verify the current user is an owner of this list
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId,
        },
      },
    });

    if (!userList || userList.role !== "OWNER") {
      return new NextResponse("Permission denied", { status: 403 });
    }

    // Add the new user to the list
    const newUserList = await prisma.userList.create({
      data: {
        userId,
        listId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Assign existing tasks to the current user
    await prisma.task.updateMany({
      where: {
        listId,
        userId: undefined
      },
      data: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      userId: newUserList.userId,
      role: newUserList.role,
      user: newUserList.user
    });
  } catch (error) {
    console.error("[LIST_USERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { listId } = await params;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    // Verify the current user is an owner of this list
    const userList = await prisma.userList.findUnique({
      where: {
        userId_listId: {
          userId: session.user.id,
          listId,
        },
      },
    });

    if (!userList || userList.role !== "OWNER") {
      return new NextResponse("Permission denied", { status: 403 });
    }

    // A list must have at least one owner
    if (userId === session.user.id) {
      const otherOwners = await prisma.userList.findMany({
        where: {
          listId,
          role: "OWNER",
          userId: { not: session.user.id },
        },
      });

      if (otherOwners.length === 0) {
        return new NextResponse("Cannot remove the only owner", { status: 400 });
      }
    }

    // Remove the user from the list
    await prisma.userList.delete({
      where: {
        userId_listId: {
          userId,
          listId,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LIST_USERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 