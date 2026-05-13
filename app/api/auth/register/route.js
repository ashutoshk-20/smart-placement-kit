import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Register Error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}