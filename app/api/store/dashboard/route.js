import prisma from "@/lib/prisma";
import authSeller from "@/middleware/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Get Dashboard Data for Seller (total orders, total earnings, total products)
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { error: "Not authorized or store not approved" },
        { status: 403 }
      );
    }

    // Get all orders for seller
    const orders = await prisma.order.findMany({ where: { storeId } });

    // Get all products for seller
    const products = await prisma.product.findMany({ where: { storeId } });

    // Get all ratings for seller's products
    const ratings = await prisma.rating.findMany({
      where: { productId: { in: products.map((product) => product.id) } },
      include: { user: true, product: true },
    });

    // Prepare dashboard data
    const dashboardData = {
      ratings,
      totalOrders: orders.length,
      totalEarnings: Math.round(
        orders.reduce((acc, order) => acc + (order.total || 0), 0)
      ),
      totalProducts: products.length,
    };

    return NextResponse.json({ dashboardData });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
