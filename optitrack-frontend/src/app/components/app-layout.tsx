"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, Home, Users, BarChart3, Timer, Menu, ClockIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const menuItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "Employees",
        url: "/employees",
        icon: Users,
    },
    {
        title: "Clock In/Out",
        url: "/punch",
        icon: Clock,
    },
    {
        title: "View Punches",
        url: "/punches",
        icon: Calendar,
    },
    {
        title: "Overtime",
        url: "/overtime",
        icon: ClockIcon,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
    },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Sidebar Header */}
            <div className="border-b p-4">
                <div className="flex items-center gap-2">
                    <Timer className="h-6 w-6 text-blue-600" />
                    <div>
                        <h1 className="text-lg font-semibold">TimeTracker</h1>
                        <p className="text-xs text-muted-foreground">Employee Clock System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Navigation</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.url}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            pathname === item.url ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                        }`}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
                <p className="text-xs text-muted-foreground">© 2024 TimeTracker System</p>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Header */}
                <header className="border-b bg-background px-4 py-3 lg:px-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm" className="lg:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                            </Sheet>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-semibold">Dashboard</h1>
                                <p className="text-sm text-muted-foreground">Welcome to your employee management system</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-mono font-bold">{new Date().toLocaleTimeString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
            </div>
        </div>
    )
}
