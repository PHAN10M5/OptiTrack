"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Calendar, Clock, Home, Users, BarChart3, Timer, Menu, ClockIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Assuming these helpers are in a common utility file, e.g., src/lib/auth.ts or src/utils/auth.ts
// If not, you'll need to define AuthenticatedUser and getAuthUser/getToken here or import them from where they are defined.
// For now, let's assume getAuthUser is available or we replicate its core logic.

// --- Replicating Auth Helpers (if not globally available or importable) ---
interface AuthenticatedUser {
    id: number;
    email: string;
    role: string;
    employeeId?: number;
    firstName?: string;
    lastName?: string;
    department?: string;
    authToken: string;
}

const BACKEND_API_BASE_URL = "http://localhost:8081"; // Ensure this matches

const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

// Simplified getAuthUser for AppLayout, primarily to get the role
const getAuthUserRole = async (): Promise<string | null> => {
    if (typeof window === "undefined") {
        return null;
    }
    const token = getToken();
    if (!token) return null;

    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
        return storedRole;
    }

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const userData = await response.json();
            if (userData && userData.role) {
                localStorage.setItem("userRole", userData.role);
                return userData.role;
            }
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
    return null;
};
// --- End Auth Helpers Replication ---


// --- UPDATED MENU ITEMS FOR ADMIN ---
const adminMenuItems = [
    {
        title: "Dashboard",
        url: "/admin-dashboard",
        icon: Home,
    },
    {
        title: "Employees",
        url: "/admin-dashboard/employees",
        icon: Users,
    },
    {
        title: "Punch Logs",
        url: "/admin-dashboard/punch-logs",
        icon: Calendar,
    },
    {
        title: "Overtime Requests",
        url: "/admin-dashboard/overtime",
        icon: ClockIcon,
    },
    {
        title: "Reports",
        url: "/admin-dashboard/reports",
        icon: BarChart3,
    },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchRole = async () => {
            const role = await getAuthUserRole();
            setUserRole(role);
        };
        fetchRole();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("employeeId");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("department");
        router.push("/login");
    };

    const isEmployee = userRole?.toUpperCase() === "EMPLOYEE";
    const showSidebar = !isEmployee; // Show sidebar ONLY if NOT an employee
    const showAppLayoutHeader = !isEmployee; // NEW: Show AppLayout's header ONLY if NOT an employee

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
                {adminMenuItems.map((item) => (
                    <Link
                        key={item.title}
                        href={item.url}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                            pathname.startsWith(item.url) ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar - Conditionally rendered */}
            {showSidebar && (
                <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
                    <SidebarContent />
                </aside>
            )}

            {/* Mobile Sidebar - Conditionally rendered */}
            {showSidebar && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            )}

            {/* Main Content */}
            {/* Added a conditional margin adjustment based on showSidebar */}
            <div className={`flex flex-1 flex-col overflow-hidden ${showSidebar ? '' : 'lg:ml-0'}`}>
                {/* Top Header - Conditionally rendered */}
                {showAppLayoutHeader && ( // NEW: Only render header if showAppLayoutHeader is true
                    <header className="border-b bg-background px-4 py-3 lg:px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Mobile Sidebar Trigger - Conditionally rendered */}
                                {showSidebar && (
                                    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                        <SheetTrigger asChild>
                                            <Button variant="ghost" size="sm" className="lg:hidden">
                                                <Menu className="h-5 w-5" />
                                            </Button>
                                        </SheetTrigger>
                                    </Sheet>
                                )}
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-semibold">Admin Dashboard</h1> {/* Always Admin Dashboard title here */}
                                    <p className="text-sm text-muted-foreground">Welcome to your employee management system</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Logout Button */}
                                <Button variant="outline" onClick={handleLogout} className="ml-4">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}