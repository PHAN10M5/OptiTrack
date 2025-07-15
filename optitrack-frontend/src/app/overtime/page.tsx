"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClockIcon, Calculator, TrendingUp, AlertTriangle, DollarSign, Calendar, Users } from "lucide-react"

export default function OvertimePage() {
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [selectedPeriod, setSelectedPeriod] = useState("week")
    const [isCalculating, setIsCalculating] = useState(false)
    const [overtimeData, setOvertimeData] = useState<any[]>([])

    // Sample overtime data
    const sampleOvertimeData = [
        {
            id: "OT001",
            employeeId: "EMP001",
            employeeName: "John Doe",
            department: "Engineering",
            regularHours: 40,
            overtimeHours: 8.5,
            overtimeRate: 1.5,
            totalPay: 1275,
            period: "2024-01-15 to 2024-01-21",
            status: "Approved",
        },
        {
            id: "OT002",
            employeeId: "EMP003",
            employeeName: "Mike Johnson",
            department: "Sales",
            regularHours: 40,
            overtimeHours: 12.0,
            overtimeRate: 1.5,
            totalPay: 1360,
            period: "2024-01-15 to 2024-01-21",
            status: "Pending",
        },
        {
            id: "OT003",
            employeeId: "EMP005",
            employeeName: "David Wilson",
            department: "Engineering",
            regularHours: 40,
            overtimeHours: 6.0,
            overtimeRate: 1.5,
            totalPay: 1180,
            period: "2024-01-15 to 2024-01-21",
            status: "Approved",
        },
    ]

    const employees = [
        { id: "EMP001", name: "John Doe", department: "Engineering" },
        { id: "EMP002", name: "Sarah Smith", department: "Marketing" },
        { id: "EMP003", name: "Mike Johnson", department: "Sales" },
        { id: "EMP004", name: "Emily Davis", department: "HR" },
        { id: "EMP005", name: "David Wilson", department: "Engineering" },
    ]

    const handleCalculateOvertime = () => {
        if (!selectedEmployee) return

        setIsCalculating(true)

        // Simulate API call
        setTimeout(() => {
            setOvertimeData(
                sampleOvertimeData.filter((ot) => selectedEmployee === "all" || ot.employeeId === selectedEmployee),
            )
            setIsCalculating(false)
        }, 1000)
    }

    const overtimeStats = {
        totalEmployeesWithOT: 3,
        totalOvertimeHours: 26.5,
        totalOvertimePay: 3815,
        averageOvertimePerEmployee: 8.8,
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Overtime Management</h1>
                    <p className="text-muted-foreground">Track and manage employee overtime hours and compensation</p>
                </div>
            </div>

            {/* Overtime Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Employees with OT</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overtimeStats.totalEmployeesWithOT}</div>
                        <p className="text-xs text-muted-foreground">This period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
                        <ClockIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{overtimeStats.totalOvertimeHours}</div>
                        <p className="text-xs text-muted-foreground">Hours worked beyond regular</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total OT Pay</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${overtimeStats.totalOvertimePay}</div>
                        <p className="text-xs text-muted-foreground">Additional compensation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average OT/Employee</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{overtimeStats.averageOvertimePerEmployee}h</div>
                        <p className="text-xs text-muted-foreground">Per employee this period</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="calculate" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="calculate">Calculate Overtime</TabsTrigger>
                    <TabsTrigger value="records">Overtime Records</TabsTrigger>
                    <TabsTrigger value="policies">OT Policies</TabsTrigger>
                </TabsList>

                <TabsContent value="calculate" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                <CardTitle>Calculate Employee Overtime</CardTitle>
                            </div>
                            <CardDescription>
                                Calculate overtime hours and compensation for employees based on their punch records
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employee">Select Employee</Label>
                                    <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Employees</SelectItem>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id}>
                                                    {emp.name} ({emp.id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="period">Time Period</Label>
                                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="custom">Custom Range</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button
                                onClick={handleCalculateOvertime}
                                disabled={!selectedEmployee || isCalculating}
                                className="w-full"
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                {isCalculating ? "Calculating..." : "Calculate Overtime"}
                            </Button>

                            {overtimeData.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Overtime Calculation Results</h3>
                                    <div className="space-y-4">
                                        {overtimeData.map((ot) => (
                                            <Card key={ot.id} className="border-l-4 border-l-orange-500">
                                                <CardContent className="pt-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold">{ot.employeeName}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {ot.employeeId} • {ot.department}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{ot.period}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Regular Hours:</span>
                                                                <span>{ot.regularHours}h</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm font-medium text-orange-600">
                                                                <span>Overtime Hours:</span>
                                                                <span>{ot.overtimeHours}h</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>OT Rate:</span>
                                                                <span>{ot.overtimeRate}x</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col justify-between">
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-green-600">${ot.totalPay}</div>
                                                                <p className="text-xs text-muted-foreground">Total Pay</p>
                                                            </div>
                                                            <Badge
                                                                variant={ot.status === "Approved" ? "default" : "secondary"}
                                                                className="w-fit ml-auto"
                                                            >
                                                                {ot.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overtime Records</CardTitle>
                            <CardDescription>View and manage all overtime records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Regular Hours</TableHead>
                                        <TableHead>OT Hours</TableHead>
                                        <TableHead>OT Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sampleOvertimeData.map((ot) => (
                                        <TableRow key={ot.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{ot.employeeName}</div>
                                                    <div className="text-sm text-muted-foreground">{ot.employeeId}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{ot.department}</TableCell>
                                            <TableCell className="text-sm">{ot.period}</TableCell>
                                            <TableCell>{ot.regularHours}h</TableCell>
                                            <TableCell className="font-medium text-orange-600">{ot.overtimeHours}h</TableCell>
                                            <TableCell className="font-medium text-green-600">${ot.totalPay}</TableCell>
                                            <TableCell>
                                                <Badge variant={ot.status === "Approved" ? "default" : "secondary"}>{ot.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="policies" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overtime Policies</CardTitle>
                                <CardDescription>Current overtime calculation rules</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-medium">Regular Work Week</span>
                                        <span>40 hours</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-medium">Overtime Rate</span>
                                        <span>1.5x regular rate</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-medium">Double Time Threshold</span>
                                        <span>12+ hours/day</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                        <span className="font-medium">Weekend Rate</span>
                                        <span>1.5x regular rate</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Overtime Alerts</CardTitle>
                                <CardDescription>Important notifications and warnings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>High Overtime Alert:</strong> 3 employees have exceeded 10 hours of overtime this week.
                                    </AlertDescription>
                                </Alert>

                                <Alert>
                                    <Calendar className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Approval Pending:</strong> 2 overtime records require manager approval.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Overtime Guidelines:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Overtime must be pre-approved by managers</li>
                                        <li>• Maximum 20 hours overtime per week</li>
                                        <li>• Double-time applies after 12 hours in a single day</li>
                                        <li>• Weekend work automatically qualifies for overtime</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
