"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, CalendarDays, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api" // Import API service
import { Punch, Employee } from "@/types" // Import Punch and Employee types
import { useSearchParams } from 'next/navigation' // For reading URL parameters
import { format } from "date-fns" // For date formatting

export default function PunchesPage() {
    const searchParams = useSearchParams()
    const initialEmployeeId = searchParams.get('employeeId') // Read employeeId from URL

    const [employeeIdInput, setEmployeeIdInput] = useState<string>(initialEmployeeId || "")
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [punches, setPunches] = useState<Punch[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchEmployeeAndPunches = async (id: number) => {
        setLoading(true)
        setError(null)
        try {
            const fetchedEmployee = await api.getEmployeeById(id)
            setEmployee(fetchedEmployee)
            const fetchedPunches = await api.getPunchesByEmployeeId(id)
            setPunches(fetchedPunches)
            if (fetchedPunches.length === 0) {
                toast({
                    id: "no-punches",
                    title: "No Punches Found",
                    description: `No punch records for employee ${fetchedEmployee.firstName} ${fetchedEmployee.lastName} (ID: ${id}).`,
                    variant: "default",
                })
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch data."
            setError(errorMessage)
            setEmployee(null)
            setPunches([])
            toast({
                id: "error",
                title: "Error",
                description: `Failed to load punches: ${errorMessage}`,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (initialEmployeeId) {
            const id = parseInt(initialEmployeeId);
            if (!isNaN(id) && id > 0) {
                fetchEmployeeAndPunches(id);
            } else {
                toast({
                    id: "invalid-employee-id",
                    title: "Invalid Employee ID",
                    description: "The employee ID in the URL is invalid.",
                    variant: "destructive",
                });
            }
        }
    }, [initialEmployeeId]); // Depend on initialEmployeeId from URL

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const id = parseInt(employeeIdInput)
        if (isNaN(id) || id <= 0) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "Please enter a valid Employee ID (a positive number).",
                variant: "destructive",
            })
            return
        }
        fetchEmployeeAndPunches(id)
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employee Punches</h1>
                    <p className="text-muted-foreground">View detailed clock-in and clock-out records</p>
                </div>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Search Punches by Employee</CardTitle>
                    <CardDescription>Enter an employee ID to view their punch history.</CardDescription>
                    <form onSubmit={handleSearch} className="flex items-center space-x-2 mt-4">
                        <Label htmlFor="employeeId" className="sr-only">Employee ID</Label>
                        <Input
                            id="employeeId"
                            type="number"
                            placeholder="Enter Employee ID (e.g., 101)"
                            value={employeeIdInput} // FIX: Changed from employeeId to employeeIdInput
                            onChange={(e) => {
                                setEmployeeIdInput(e.target.value); // FIX: Changed from setEmployeeId to setEmployeeIdInput
                                // Clear error/punches when input changes
                                setError(null);
                                setPunches([]);
                                setEmployee(null);
                            }}
                            className="flex-1"
                            min="1"
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            <Search className="mr-2 h-4 w-4" />
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </CardHeader>
                <CardContent>
                    {loading && <div className="text-center py-8">Loading punches...</div>}
                    {error && <div className="text-center py-8 text-red-600">Error: {error}</div>}

                    {!loading && !error && employee && (
                        <div className="space-y-4 mt-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Punches for: {employee.firstName} {employee.lastName} (ID: {employee.id})
                            </h3>
                            {punches.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No punch records found for this employee.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Punch ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {punches.map((punch) => (
                                            <TableRow key={punch.id}>
                                                <TableCell className="font-medium">{punch.id}</TableCell>
                                                <TableCell>
                                                    <Badge variant={punch.punchType === "IN" ? "default" : "secondary"}
                                                           className={punch.punchType === "IN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                        {punch.punchType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                                                        {new Date(punch.timestamp).toLocaleDateString()}
                                                        <Clock className="ml-2 h-3 w-3 text-muted-foreground" />
                                                        {new Date(punch.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    )}
                    {!loading && !error && !employee && employeeIdInput && (
                        <p className="text-muted-foreground text-center py-8">Employee with ID {employeeIdInput} not found or no data to display. Enter an Employee ID and click search.</p>
                    )}
                    {!loading && !error && !employee && !employeeIdInput && (
                        <p className="text-muted-foreground text-center py-8">Enter an Employee ID to view their punch history.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
