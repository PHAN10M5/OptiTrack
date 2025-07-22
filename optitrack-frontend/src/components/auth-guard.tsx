"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false) // Use boolean for authentication status
    const [userRole, setUserRole] = useState<string | null>(null) // State to store fetched user role
    const router = useRouter()

    useEffect(() => {
        const authToken = localStorage.getItem("authToken")
        const storedUserRole = localStorage.getItem("userRole")

        if (!authToken || !storedUserRole) {
            // User is NOT authenticated or role is missing
            router.push("/login")
            return
        }

        // User is authenticated, now check role requirements
        setIsAuthenticated(true)
        setUserRole(storedUserRole)

        if (requireAdmin && storedUserRole !== "admin") {
            // If admin is required but user is not admin, redirect to employee dashboard
            router.push("/employee-dashboard")
            return
        }

        // If not requiring admin, or if requiring admin and user IS admin,
        // then authentication and role checks pass.
        setIsLoading(false)
    }, [router, requireAdmin]) // Depend on router and requireAdmin

    // Display loading spinner while checking authentication status
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    // If not loading but not authenticated (should be caught by router.push above, but defensive check)
    if (!isAuthenticated) {
        return null // Or a more explicit message/redirect if needed
    }

    // If authenticated and checks passed, render children
    return <>{children}</>
}