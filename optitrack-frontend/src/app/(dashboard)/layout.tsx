import type React from "react";
import { AuthGuard } from "@/components/auth-guard"; // Your existing AuthGuard
import { AppLayout } from "@/components/app-layout"; // Your existing AppLayout

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        // AuthGuard ensures only authenticated users can access these routes.
        // AppLayout provides the common dashboard UI (sidebar, header, etc.).
        <AuthGuard> {/* We'll adjust AuthGuard's role check inside it later if needed */}
            <AppLayout>
                {children}
            </AppLayout>
        </AuthGuard>
    );
}