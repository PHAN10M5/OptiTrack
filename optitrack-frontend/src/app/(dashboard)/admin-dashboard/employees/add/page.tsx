"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// Consistent UserInfo interface
interface UserInfo {
    name: string;
    role: string;
    employeeId: number | null;
    authToken: string | null;
}

// Consistent getUserInfo function
const getUserInfo = (): UserInfo | null => {
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("currentUser");
        const authToken = localStorage.getItem("authToken");

        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                return {
                    name: userData.name || "Admin User",
                    role: userData.role || "",
                    employeeId: userData.id ? parseInt(userData.id) : null,
                    authToken: authToken,
                };
            } catch (e) {
                console.error("Error parsing currentUser from localStorage", e);
                return null;
            }
        }
    }
    return null;
};

export default function AddEmployeePage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        position: "",
        phoneNumber: "",
        hireDate: "",
        // hourlyRate: "", // Removed as it might be specific to payroll or not directly tied to core employee creation
    })
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useState<UserInfo | null>(getUserInfo()) // Initialize user
    const { toast } = useToast()
    const router = useRouter()

    const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Customer Service"]

    useEffect(() => {
        // We assume parent layout handles primary admin auth.
        // This is a defensive check to ensure user is logged in and is admin.
        if (!user || user.role.toLowerCase() !== "admin") {
            router.push("/login")
            toast({
                id: "access-denied",
                title: "Access Denied",
                description: "You do not have administrative privileges to view this page.",
                variant: "destructive",
            })
            return
        }
    }, [user, router, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Frontend Validation
        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "First name, last name, and email are required.",
                variant: "destructive",
            })
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast({
                id: "validation-error-email",
                title: "Validation Error",
                description: "Please enter a valid email address.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const token = user?.authToken
            if (!token) {
                throw new Error("Authentication token is missing. Please log in again.")
            }

            // Construct payload for the backend
            // Ensure this matches your Spring Boot Employee DTO's structure for creation
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                department: formData.department || null, // Send null or empty string if not selected
                position: formData.position || null,
                contactNumber: formData.phoneNumber || null, // Backend might expect 'contactNumber'
                hireDate: formData.hireDate || null, // Send null if empty string
                // hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null, // If backend expects this for creation
            }

            const response = await fetch(`${BACKEND_API_BASE_URL}/api/employees`, { // Adjust to your employee creation endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                // Backend is expected to return a specific message for email already exists
                if (response.status === 409) { // Assuming 409 Conflict for duplicate email
                    throw new Error(errorData.message || "An employee with this email already exists.")
                }
                throw new Error(errorData.message || "Failed to add employee.")
            }

            const newEmployee = await response.json() // Backend might return the created employee object

            toast({
                id: "success-adding-employee",
                title: "Success!",
                description: `Employee ${newEmployee.firstName} ${newEmployee.lastName} added successfully!`,
                variant: "default",
            })

            // Clear form and optionally redirect
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                department: "",
                position: "",
                phoneNumber: "",
                hireDate: "",
                // hourlyRate: "",
            })
            // Optionally redirect back to the employee list or to a details page
            router.push("/admin-dashboard/employees");

        } catch (err) {
            console.error("Error adding employee:", err)
            toast({
                id: "error-adding-employee",
                title: "Error adding employee",
                description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8"> {/* Consistent padding */}
            <div className="flex items-center gap-4">
                <Link href="/admin-dashboard/employees"> {/* Corrected back link */}
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Employees
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Add New Employee</h1>
                    <p className="text-muted-foreground font-body">Create a new employee record</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card className="border-0 shadow-modern"> {/* Consistent card styling */}
                    <CardHeader>
                        <CardTitle className="font-display">Employee Information</CardTitle>
                        <CardDescription className="font-body">
                            Enter the employee's basic information. Fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Enter first name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Enter last name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email address"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">This will be used for login authentication</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">Position/Job Title</Label>
                                    <Input
                                        id="position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        placeholder="Enter job title"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="hireDate">Hire Date</Label>
                                    <Input
                                        id="hireDate"
                                        type="date"
                                        value={formData.hireDate}
                                        onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Removed Hourly Rate for now as it's typically part of a more complex payroll system and might not be directly added during initial employee creation.
                                If your backend /api/employees POST endpoint accepts it, you can re-add it.
                            <div className="space-y-2">
                                <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.hourlyRate}
                                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                    placeholder="Enter hourly rate (e.g., 25.00)"
                                />
                                <p className="text-xs text-muted-foreground">Used for payroll and overtime calculations</p>
                            </div>
                            */}

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        "Saving..."
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Employee
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setFormData({
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            department: "",
                                            position: "",
                                            phoneNumber: "",
                                            hireDate: "",
                                            // hourlyRate: "",
                                        })
                                    }
                                >
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                        <Alert className="mt-4 border-l-4 border-blue-500 text-blue-800 bg-blue-50">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">Important</AlertTitle>
                            <AlertDescription>
                                **Next Step:** After creating the employee, they will need an initial password or to set one up. This is usually handled via a separate "user creation" or "account activation" process on the backend. Your Spring Boot application will likely need a dedicated endpoint for this.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}