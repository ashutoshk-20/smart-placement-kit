import { getUserIdFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getUserIdFromRequest();

    if (!userId) {
      return Response.json({ authenticated: false });
    }

    return Response.json({
      authenticated: true,
      userId,
    });

  } catch {
    return Response.json({ authenticated: false });
  }
}