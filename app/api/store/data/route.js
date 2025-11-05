import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get store info and store products
export async function GET(request) {
  try {
    // Get store username from query params
    const { searchParams } = new URL(request.url);
    const usernameParam = searchParams.get("username");

    if (!usernameParam) {
      return NextResponse.json(
        { error: "Missing username" },
        { status: 400 }
      );
    }

    const username = usernameParam.toLowerCase();

    // Get store info and in-stock products with ratings
    const store = await prisma.store.findFirst({
      where: { username, isActive: true },
      include: {
        products: {
          where: { inStock: true },
          include: {
            ratings: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
