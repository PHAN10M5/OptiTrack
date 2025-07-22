"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// Define interfaces for data structures
interface Employee {
    id: number
    firstName: string
    lastName: string
    email: string
    department: string
    position: string
    contactNumber: string
    address: string // Assuming address field is present
    hireDate: string // ISO date string
}

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

export default function EmployeeDetailsPage() {
    const { id } = useParams() // Get the ID from the URL
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : null; // Ensure ID is a number
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<UserInfo | null>(getUserInfo())
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        // Authentication and Authorization Check
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

        const fetchEmployeeDetails = async () => {
            if (!employeeId) {
                setError("Invalid employee ID provided.")
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                const token = user?.authToken
                if (!token) {
                    throw new Error("Authentication token is missing. Please log in again.")
                }

                const response = await fetch(`${BACKEND_API_BASE_URL}/api/employees/${employeeId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                })

                if (response.status === 404) {
                    setError(`Employee with ID ${employeeId} not found.`)
                    setEmployee(null)
                    toast({
                        id: "employee-not-found",
                        title: "Employee Not Found",
                        description: `No employee found with ID: ${employeeId}.`,
                        variant: "destructive",
                    })
                    return
                }

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || `Failed to fetch employee details for ID: ${employeeId}.`)
                }

                const data: Employee = await response.json()
                setEmployee(data)

            } catch (err) {
                console.error("Error fetching employee details:", err)
                setError(err instanceof Error ? err.message : "An unexpected error occurred while loading employee details.")
                toast({
                    id: "error-fetching-employee",
                    title: "Error Loading Employee",
                    description: err instanceof Error ? err.message : "An unexpected error occurred.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (user) { // Only fetch if user object is available (implies auth check passed)
            fetchEmployeeDetails()
        }
    }, [employeeId, user, router, toast])


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p>Loading employee details...</p>
                </div>
            </div>
        )
    }

    if (error && !employee) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Employee</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <div className="mt-4">
                        <Link href="/admin-dashboard/employees">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employee List
                            </Button>
                        </Link>
                    </div>
                </Alert>
            </div>
        );
    }

    if (!employee) {
        // This case handles when employeeId is null initially or if employee is null after fetch attempt (e.g., 404 handled)
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Employee Found</AlertTitle>
                    <AlertDescription>
                        The employee record could not be found or an invalid ID was provided.
                    </AlertDescription>
                    <div className="mt-4">
                        <Link href="/admin-dashboard/employees">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employee List
                            </Button>
                        </Link>
                    </div>
                </Alert>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin-dashboard/employees">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Employees
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">
                            {employee.firstName} {employee.lastName}
                        </h1>
                        <p className="text-muted-foreground font-body">Employee ID: {employee.id}</p>
                    </div>
                </div>
                <Link href={`/admin-dashboard/employees/edit/${employee.id}`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Employee
                    </Button>
                </Link>
            </div>

            <Card className="border-0 shadow-modern">
                <CardHeader>
                    <CardTitle className="font-display">Personal Information</CardTitle>
                    <CardDescription className="font-body">Basic details of the employee.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-lg">{employee.firstName} {employee.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                        <p className="text-lg">{employee.email}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Department</p>
                        <p className="text-lg">{employee.department || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Position</p>
                        <p className="text-lg">{employee.position || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                        <p className="text-lg">{employee.contactNumber || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                        <p className="text-lg">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-lg">{employee.address || "N/A"}</p>
                    </div>
                </CardContent>
            </Card>

            {/* You could add more sections here like:
            <Card className="border-0 shadow-modern mt-6">
                <CardHeader>
                    <CardTitle className="font-display">Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
                        <p className="text-lg">$XX.XX</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                        <p className="text-lg">Active</p>
                    </div>
                </CardContent>
            </Card>
            */}
        </div>
    )
}