// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/api/:path*", "/((?!_next|.*\\..*|favicon.ico).*)"],
};
