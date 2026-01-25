import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not found</h2>
            <h2 className="text-gray-600 mb-8">
                Opps! The page you are looking for does&apos;t exist or has been moved.
            </h2>
            <Link href={"/"}>
                <Button>Return Home</Button>
            </Link>
        </div>
    )
}