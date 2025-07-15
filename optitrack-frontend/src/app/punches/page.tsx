"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, UserCheck, UserX } from "lucide-react"

export default function PunchesPage() {
    const [employeeId, setEmployeeId] = useState("")
    const [punches, setPunches] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Sample punch data
    const samplePunches = [
        { id: "P001", employeeId: "EMP001", type: "IN", timestamp: "2024-01-15 09:00:00" },
        { id: "P002", employeeId: "EMP001", type: "OUT", timestamp: "2024-01-15 17:30:00" },
        { id: "P003", employeeId: "EMP001", type: "IN", timestamp: "2024-01-16 08:45:00" },
        { id: "P004", employeeId: "EMP001", type: "OUT", timestamp: "2024-01-16 17:15:00" },
        { id: "P005", employeeId: "EMP001", type: "IN", timestamp: "2024-01-17 09:15:00" },
    ]

    const handleSearch = () => {
        if (!employeeId.trim()) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            const filteredPunches = samplePunches.filter((punch) => punch.employeeId === employeeId)
            setPunches(filteredPunches)
            setIsLoading(false)
        }, 500)
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">View Employee Punches</h1>
                    <p className="text-muted-foreground">Search and view punch records for employees</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Employee Punches</CardTitle>
                    <CardDescription>Enter an Employee ID to view their punch history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="searchEmployeeId">Employee ID</Label>
                            <Input
                                id="searchEmployeeId"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter Employee ID (e.g., EMP001)"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isLoading}>
                            <Search className="mr-2 h-4 w-4" />
                            {isLoading ? "Searching..." : "Search"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {punches.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Punch Records for {employeeId}</CardTitle>
                        <CardDescription>Chronologically ordered punch events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Punch ID</TableHead>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Punch Type</TableHead>
                                    <TableHead>Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {punches.map((punch) => (
                                    <TableRow key={punch.id}>
                                        <TableCell className="font-medium">{punch.id}</TableCell>
                                        <TableCell>{punch.employeeId}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={punch.type === "IN" ? "default" : "secondary"}
                                                className={punch.type === "IN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                            >
                                                {punch.type === "IN" ? (
                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <UserX className="mr-1 h-3 w-3" />
                                                )}
                                                {punch.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono">{punch.timestamp}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {employeeId && punches.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Punches Found</h3>
                        <p className="text-muted-foreground">No punch records found for Employee ID: {employeeId}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
