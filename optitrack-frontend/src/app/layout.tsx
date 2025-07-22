import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { AppLayout } from "@/app/components/app-layout"
import "./globals.css"

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-background">
        <AppLayout>{children}</AppLayout>
        <Toaster />
        </body>
        </html>
    )
}
