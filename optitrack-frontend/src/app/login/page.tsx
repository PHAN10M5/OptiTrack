"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Timer, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// Define your backend API base URL
// Make sure this matches where your Spring Boot application is running
const BACKEND_API_BASE_URL = "http://localhost:8081";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            // Check if the response was successful (status code 2xx)
            if (!response.ok) {
                // Parse error message from the backend if available
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed. Please check your credentials.");
            }

            // If login is successful, parse the response data
            const data = await response.json();

            localStorage.setItem("authToken", data.token);

            // Store the full user object (or relevant parts) for the dashboard
            // Ensure your backend's login response `data` contains these fields:
            // id, name (or employeeFullName), role, department
            const userForLocalStorage = {
                id: data.employeeId || data.id, // Use employeeId if available, otherwise data.id
                name: data.employeeFullName || data.name, // Use employeeFullName if available, otherwise data.name
                role: data.role.toLowerCase(),
                department: data.department || "N/A", // Assuming department comes from backend
                // Add any other user details your EmployeeDashboard needs
            };
            localStorage.setItem("currentUser", JSON.stringify(userForLocalStorage));

            // Optional: Store individual items if still needed elsewhere,
            // though 'currentUser' should largely cover it for dashboard
            localStorage.setItem("userRole", data.role.toLowerCase());
            localStorage.setItem("employeeId", String(data.employeeId));

            console.log("Login successful:", data); // Log the full response for debugging

            // Redirect based on the role received from the backend
            if (data.role.toLowerCase() === "admin") {
                router.push("/admin-dashboard"); // FIX: Redirect admin to their dashboard
            } else {
                router.push("/employee-dashboard"); // Redirect regular employee to their dashboard
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during login.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                            <Timer className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-display text-balance">OptiTrack Login</CardTitle>
                        <CardDescription className="font-body">Sign in to your employee account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-heading mb-2">Demo Accounts:</h3>
                            <div className="space-y-2 text-sm font-body">
                                <div>
                                    <strong className="font-caption">Admin:</strong> john.doe@optitrack.com
                                </div>
                                <div>
                                    <strong className="font-caption">Employee:</strong> sarah.smith@optitrack.com
                                </div>
                                <div className="text-muted-foreground font-caption">Password: password123</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}