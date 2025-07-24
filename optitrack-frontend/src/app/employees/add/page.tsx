"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api" // Import API service
import { CreateEmployeePayload } from "@/types" // Import types

export default function AddEmployeePage() {
    const [formData, setFormData] = useState<CreateEmployeePayload>({
        firstName: "",
        lastName: "",
        department: null, // Initialize department as null or undefined as per backend
    })
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Customer Service"]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.firstName || !formData.lastName) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "First name and last name are required.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            const payload: CreateEmployeePayload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                // Ensure that the special "none-selected" value is converted back to null for the backend
                department: formData.department === "none-selected" ? null : formData.department,
            };
            await api.createEmployee(payload)
            toast({
                id: "success",
                title: "Success!",
                description: `Employee ${formData.firstName} ${formData.lastName} has been added successfully.`,
                variant: "success", // Use custom success variant
            })
            setFormData({ firstName: "", lastName: "", department: null }) // Reset form
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred."
            toast({
                id: "error",
                title: "Error adding employee",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/employees">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Employees
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
                    <p className="text-muted-foreground">Create a new employee record</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                        <CardDescription>
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
                                <Label htmlFor="department">Department</Label>
                                <Select
                                    // If formData.department is null, use "none-selected" for the Select component's value
                                    value={formData.department === null ? "none-selected" : formData.department}
                                    onValueChange={(value) =>
                                        // Convert "none-selected" back to null when updating state
                                        setFormData({ ...formData, department: value === "none-selected" ? null : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a department (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Use a distinct, non-empty string value for the "None" option */}
                                        <SelectItem value="none-selected">None</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                    onClick={() => setFormData({ firstName: "", lastName: "", department: null })}
                                    disabled={isLoading}
                                >
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
