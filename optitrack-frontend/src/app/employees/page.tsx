"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye, UserCheck, UserX } from "lucide-react"
import Link from "next/link"

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState("")

    const employees = [
        { id: "EMP001", firstName: "John", lastName: "Doe", department: "Engineering", status: "Clocked In" },
        { id: "EMP002", firstName: "Sarah", lastName: "Smith", department: "Marketing", status: "Clocked Out" },
        { id: "EMP003", firstName: "Mike", lastName: "Johnson", department: "Sales", status: "Clocked In" },
        { id: "EMP004", firstName: "Emily", lastName: "Davis", department: "HR", status: "Clocked Out" },
        { id: "EMP005", firstName: "David", lastName: "Wilson", department: "Engineering", status: "Clocked In" },
        { id: "EMP006", firstName: "Lisa", lastName: "Brown", department: "Finance", status: "Clocked In" },
    ]

    const filteredEmployees = employees.filter(
        (employee) =>
            `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={employee.status === "Clocked In" ? "default" : "secondary"}
                                            className={
                                                employee.status === "Clocked In" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                            }
                                        >
                                            {employee.status === "Clocked In" ? (
                                                <UserCheck className="mr-1 h-3 w-3" />
                                            ) : (
                                                <UserX className="mr-1 h-3 w-3" />
                                            )}
                                            {employee.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
