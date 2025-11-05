import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Create a Store
export async function POST(request) {
  try {
    // 1️⃣ Authenticate user via Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // 2️⃣ Get FormData from request
    const formData = await request.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const email = formData.get("email");
    const image = formData.get("image");

    // 3️⃣ Validate input
    if (!name || !username || !description || !email || !contact || !address || !image) {
      return NextResponse.json({ error: "Missing store info" }, { status: 400 });
    }

    // 4️⃣ Ensure the Clerk user exists in your database
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: username, // you can replace with actual full name if available
          image: "https://placehold.co/100x100?text=User", // ✅ FIX: added image to prevent Prisma error
        },
      });
    }

    // 5️⃣ Check if this user already has a store
    const existingStore = await prisma.store.findFirst({ where: { userId } });
    if (existingStore) {
      return NextResponse.json({ status: existingStore.status });
    }

    // 6️⃣ Check if username is already taken
    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });
    if (isUsernameTaken) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // 7️⃣ Upload image to ImageKit
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: uploadResponse.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    // 8️⃣ Create new store
    const newStore = await prisma.store.create({
      data: {
        userId: user.id,
        name,
        description,
        username: username.toLowerCase(),
        email,
        contact,
        address,
        logo: optimizedImage,
      },
    });

    // 9️⃣ Link store to user
    await prisma.user.update({
      where: { id: user.id },
      data: { store: { connect: { id: newStore.id } } },
    });

    return NextResponse.json(
      { message: "Applied, waiting for approval" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
