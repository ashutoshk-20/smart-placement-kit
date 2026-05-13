import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Login Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}