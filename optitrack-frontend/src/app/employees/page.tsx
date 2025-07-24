"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api"
import { Employee, Punch, UpdateEmployeePayload } from "@/types"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Extend Employee type to include their current clock status for display
interface EmployeeWithStatus extends Employee {
    currentStatus: 'Clocked In' | 'Clocked Out';
}

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [employees, setEmployees] = useState<EmployeeWithStatus[]>([]) // Use EmployeeWithStatus
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    // State for editing
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
    const [editFormData, setEditFormData] = useState<UpdateEmployeePayload>({
        firstName: "",
        lastName: "",
        department: null,
    })

    const departments = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Customer Service"]

    const fetchEmployeesWithStatus = async () => {
        setLoading(true)
        setError(null)
        try {
            const fetchedEmployees: Employee[] = await api.getEmployees()
            const employeesWithStatus: EmployeeWithStatus[] = [];

            // For each employee, fetch their last punch to determine status
            // This is an N+1 query pattern. For very large number of employees,
            // a dedicated backend endpoint returning employee status would be more efficient.
            for (const emp of fetchedEmployees) {
                let status: 'Clocked In' | 'Clocked Out' = 'Clocked Out'; // Default to clocked out
                try {
                    const punches: Punch[] = await api.getPunchesByEmployeeId(emp.id);
                    if (punches.length > 0) {
                        // Sort punches by timestamp to get the most recent one
                        const lastPunch = punches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                        if (lastPunch.punchType === "IN") {
                            status = 'Clocked In';
                        }
                    }
                } catch (punchErr: any) {
                    console.warn(`Could not fetch punches for employee ID ${emp.id}: ${punchErr.message}`);
                    // If punches cannot be fetched, status remains 'Clocked Out' by default
                }
                employeesWithStatus.push({ ...emp, currentStatus: status });
            }

            setEmployees(employeesWithStatus);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch employees."
            setError(errorMessage)
            toast({
                id: "error",
                title: "Error",
                description: `Failed to load employees: ${errorMessage}`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployeesWithStatus()
    }, [])

    const filteredEmployees = employees.filter(
        (employee) =>
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            employee.id.toString().includes(searchTerm.toLowerCase()),
    )

    const handleDelete = async (id: number) => {
        try {
            await api.deleteEmployee(id)
            toast({
                id: "success",
                title: "Success!",
                description: "Employee deleted successfully.",
                variant: "success",
            })
            fetchEmployeesWithStatus() // Refresh the list with updated statuses
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to delete employee."
            toast({
                id: "error",
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }

    const handleEditClick = (employee: Employee) => {
        setCurrentEmployee(employee)
        setEditFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            department: employee.department,
        })
        setIsEditDialogOpen(true)
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentEmployee) return

        if (!editFormData.firstName || !editFormData.lastName) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "First name and last name are required.",
                variant: "destructive",
            })
            return
        }

        try {
            await api.updateEmployee(currentEmployee.id, editFormData)
            toast({
                id: "success",
                title: "Success!",
                description: "Employee updated successfully.",
                variant: "success",
            })
            setIsEditDialogOpen(false)
            fetchEmployeesWithStatus() // Refresh the list with updated statuses
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update employee."
            toast({
                id: "error",
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }


    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xl text-muted-foreground">
                Loading employees...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                        <p className="text-muted-foreground">Manage your workforce and employee records</p>
                    </div>
                </div>
                <Link href="/employees/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                    <CardDescription>Search and manage employee records</CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employees by name, department, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEmployees.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No employees found matching your search.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.id}</TableCell>
                                        <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                                        <TableCell>{employee.department || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={employee.currentStatus === "Clocked In" ? "default" : "secondary"}
                                                className={
                                                    employee.currentStatus === "Clocked In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }
                                            >
                                                {employee.currentStatus === "Clocked In" ? (
                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <UserX className="mr-1 h-3 w-3" />
                                                )}
                                                {employee.currentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/punches?employeeId=${employee.id}`}>
                                                    <Button variant="ghost" size="sm" title="View Punches">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(employee)} title="Edit Employee">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Delete Employee">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the employee record
                                                                and remove their associated punch data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(employee.id)}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Employee Dialog */}
            {currentEmployee && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Employee</DialogTitle>
                            <DialogDescription>
                                Make changes to employee details here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="editFirstName">First Name</Label>
                                <Input
                                    id="editFirstName"
                                    value={editFormData.firstName}
                                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editLastName">Last Name</Label>
                                <Input
                                    id="editLastName"
                                    value={editFormData.lastName}
                                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editDepartment">Department</Label>
                                <Select
                                    value={editFormData.department || "none-selected"} // Handle null for display
                                    onValueChange={(value) => setEditFormData({ ...editFormData, department: value === "none-selected" ? null : value })}
                                >
                                    <SelectTrigger id="editDepartment">
                                        <SelectValue placeholder="Select a department (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none-selected">None</SelectItem> {/* Use distinct value */}
                                        {departments.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Save changes</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
