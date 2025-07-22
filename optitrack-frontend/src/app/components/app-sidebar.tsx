"use client"

import { Calendar, Clock, Home, Users, BarChart3, Timer } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar"

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
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-4 py-3">
                    <Timer className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base font-semibold truncate">TimeTracker</h1>
                        <p className="text-xs text-muted-foreground truncate">Employee Clock System</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border">
                <div className="p-3 text-xs text-muted-foreground">© 2024 TimeTracker System</div>
            </SidebarFooter>
        </Sidebar>
    )
}
