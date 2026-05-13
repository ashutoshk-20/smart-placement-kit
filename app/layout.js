import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SoftStart",
  description: "An AI-powered career assistant to help you land your dream job.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {/* header */}
            <Header />

            <main className="min-h-screen">
              {children}
            </main>
            <Toaster richColors />

            {/* footer */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>©️ 2026 SoftStart. All rights reserved.</p>
              </div>
            </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

