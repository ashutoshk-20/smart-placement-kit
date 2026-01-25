import { currentUser } from "@clerk/nextjs/server";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    try {
        await dbConnect();
        const loggedInUser = await User.findOne({
            clerkUserId: user.id
        });

        if (loggedInUser) {
            return loggedInUser;
        }

        const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

        const newUser = await User.create({
            clerkUserId: user.id,
            email: user.emailAddresses[0].emailAddress,
            name: name || "Anonymous",
            imageUrl: user.imageUrl || user.profileImageUrl,
        });

        return newUser;
    } catch (error) {
        console.log("Error in checkUser:", error.message);
        return null;
    }
}