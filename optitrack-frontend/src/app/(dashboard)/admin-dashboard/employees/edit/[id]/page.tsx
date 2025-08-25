"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
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
    // Add any other fields your backend Employee DTO returns
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

export default function EditEmployeePage() {
    const { id } = useParams()
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : null;

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        department: "",
        position: "",
        phoneNumber: "", // Using phoneNumber for the form, will map to contactNumber for API
        hireDate: "",
        address: "", // Added address to form data
    })
    const [isLoading, setIsLoading] = useState(true) // For initial data fetch
    const [isSaving, setIsSaving] = useState(false) // For form submission
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<UserInfo | null>(getUserInfo())
    const router = useRouter()
    const { toast } = useToast()

    const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Customer Service"]

    // Authentication and data fetching
    useEffect(() => {
        if (!user || user.role.toLowerCase() !== "admin") {
            router.push("/login")
            toast({
                id: "access-denied-toast",
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
                    toast({
                        id: "error-toast",
                        title: "Employee Not Found",
                        description: `No employee found with ID: ${employeeId}.`,
                        variant: "destructive",
                    })
                    // Redirect to list if not found
                    router.replace("/admin-dashboard/employees");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || `Failed to fetch employee details for ID: ${employeeId}.`)
                }

                const data: Employee = await response.json()
                // Populate form data
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    department: data.department || "",
                    position: data.position || "",
                    phoneNumber: data.contactNumber || "", // Map contactNumber to phoneNumber for form
                    hireDate: data.hireDate ? data.hireDate.split('T')[0] : "", // Format to YYYY-MM-DD for input type="date"
                    address: data.address || "",
                })

            } catch (err) {
                console.error("Error fetching employee details:", err)
                setError(err instanceof Error ? err.message : "An unexpected error occurred while loading employee details.")
                toast({
                    id: "error-toast",
                    title: "Error Loading Employee",
                    description: err instanceof Error ? err.message : "An unexpected error occurred.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (user) {
            fetchEmployeeDetails()
        }
    }, [employeeId, user, router, toast])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!employeeId) {
            toast({
                id: "missing-employee-id-error",
                title: "Error",
                description: "Employee ID is missing for update operation.",
                variant: "destructive",
            })
            return;
        }

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
                id: "email-validation-error",
                title: "Validation Error",
                description: "Please enter a valid email address.",
                variant: "destructive",
            })
            return
        }

        setIsSaving(true)

        try {
            const token = user?.authToken
            if (!token) {
                throw new Error("Authentication token is missing. Please log in again.")
            }

            // Construct payload for the backend (PUT request)
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                department: formData.department || null,
                position: formData.position || null,
                contactNumber: formData.phoneNumber || null, // Map phoneNumber from form to contactNumber for API
                hireDate: formData.hireDate || null,
                address: formData.address || null,
                // Do NOT include ID in the body for PUT, it's typically in the URL path
            }

            const response = await fetch(`${BACKEND_API_BASE_URL}/api/employees/${employeeId}`, {
                method: "PUT", // Use PUT for full updates, or PATCH for partial
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                // Specific handling for duplicate email on update if your backend returns 409
                if (response.status === 409) {
                    throw new Error(errorData.message || "Another employee with this email already exists.")
                }
                throw new Error(errorData.message || `Failed to update employee ID: ${employeeId}.`)
            }

            toast({
                id: "success-toast",
                title: "Success!",
                description: `Employee ID ${employeeId} updated successfully.`,
                variant: "default",
            })
            // Redirect back to employee details page or list after successful update
            router.push(`/admin-dashboard/employees/${employeeId}`);

        } catch (err) {
            console.error("Error updating employee:", err)
            toast({
                id: "error-toast",
                title: "Error updating employee",
                description: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p>Loading employee details for editing...</p>
                </div>
            </div>
        )
    }

    if (error && !formData.firstName) { // If there's an error and form hasn't been populated
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Employee for Edit</AlertTitle>
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

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center gap-4">
                <Link href={`/admin-dashboard/employees/${employeeId}`}> {/* Back to specific employee details */}
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Employee Details
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Edit Employee</h1>
                    <p className="text-muted-foreground font-body">Update details for Employee ID: {employeeId}</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card className="border-0 shadow-modern">
                    <CardHeader>
                        <CardTitle className="font-display">Employee Information</CardTitle>
                        <CardDescription className="font-body">
                            Modify the employee's details. Fields marked with * are required.
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
                                <p className="text-xs text-muted-foreground">This is used for login authentication</p>
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

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter employee's address"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()} // Go back without saving
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}