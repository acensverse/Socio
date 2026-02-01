import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { MessageSlider } from "@/components/messages/MessageSlider";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";
import { MainLayout } from "@/components/layout/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Social App",
  description: "A modern social media experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground antialiased")}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <MainLayout>
              {children}
            </MainLayout>
          </div>
          <BottomNav />
          <MessageSlider />
        </Providers>
      </body>
    </html>
  );
}
