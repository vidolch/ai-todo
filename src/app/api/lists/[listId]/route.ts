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

    const { name, description, color } = await req.json();
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

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error("[LIST_PATCH]", error);
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