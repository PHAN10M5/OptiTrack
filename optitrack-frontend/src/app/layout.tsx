import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-background">
        {children} {/* This is where your page content or nested layouts will render */}
        <Toaster />
        </body>
        </html>
    );
}