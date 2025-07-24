"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClockIcon, Calculator, TrendingUp, AlertTriangle, DollarSign, Calendar, Users } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker" // Import the DatePicker component
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns" // For date manipulation
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api" // Import API service
import { Employee, OvertimeRequest } from "@/types" // Import Employee and OvertimeRequest types

export default function OvertimePage() {
    const { toast } = useToast()

    // State for employee selection and data fetching
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("") // Employee ID as string for Select component
    const [employeesLoading, setEmployeesLoading] = useState(true)
    const [employeesError, setEmployeesError] = useState<string | null>(null)

    // State for overtime calculation tab
    const [selectedPeriod, setSelectedPeriod] = useState("week")
    const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
    const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)
    const [isCalculating, setIsCalculating] = useState(false)
    const [calculatedOvertimeResult, setCalculatedOvertimeResult] = useState<number | null>(null)
    const [calculationError, setCalculationError] = useState<string | null>(null)

    // State for overtime records tab
    const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRequest[]>([])
    const [recordsLoading, setRecordsLoading] = useState(true)
    const [recordsError, setRecordsError] = useState<string | null>(null)

    // Fetch Employees on component mount
    useEffect(() => {
        const fetchEmployees = async () => {
            setEmployeesLoading(true)
            setEmployeesError(null)
            try {
                const data = await api.getEmployees()
                setEmployees(data)
                if (data.length > 0) {
                    setSelectedEmployeeId("all") // Default to "All Employees"
                }
            } catch (err: any) {
                setEmployeesError(err.response?.data?.message || err.message || "Failed to fetch employees.")
                toast({
                    id: "employees-error",
                    title: "Error",
                    description: `Failed to load employees for selection: ${err.response?.data?.message || err.message || "An unexpected error occurred."}`,
                    variant: "destructive",
                })
            } finally {
                setEmployeesLoading(false)
            }
        }
        fetchEmployees()
    }, [])

    // Fetch Overtime Records for the "records" tab
    useEffect(() => {
        const fetchOvertimeRecords = async () => {
            setRecordsLoading(true)
            setRecordsError(null)
            try {
                const data = await api.getOvertimeRequests()
                setOvertimeRecords(data)
            } catch (err: any) {
                setRecordsError(err.response?.data?.message || err.message || "Failed to fetch overtime records.")
                toast({
                    id: "overtime-records-error",
                    title: "Error",
                    description: `Failed to load overtime records: ${err.response?.data?.message || err.message || "An unexpected error occurred."}`,
                    variant: "destructive",
                })
            } finally {
                setRecordsLoading(false)
            }
        }
        fetchOvertimeRecords()
    }, [])


    const handleCalculateOvertime = async () => {
        if (!selectedEmployeeId || selectedEmployeeId === "all") {
            toast({
                id: "employee-required",
                title: "Selection Required",
                description: "Please select a specific employee to calculate hours.",
                variant: "destructive",
            });
            return;
        }

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        const now = new Date();

        switch (selectedPeriod) {
            case "week":
                startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
                endDate = endOfWeek(now, { weekStartsOn: 1 });
                break;
            case "month":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "custom":
                if (!customStartDate || !customEndDate) {
                    toast({
                        id: "date-range-required",
                        title: "Date Range Required",
                        description: "Please select both start and end dates for a custom period.",
                        variant: "destructive",
                    });
                    return;
                }
                startDate = customStartDate;
                endDate = customEndDate;
                break;
            default:
                toast({
                    id: "invalid-period",
                    title: "Invalid Period",
                    description: "Please select a valid time period.",
                    variant: "destructive",
                });
                return;
        }

        if (startDate && endDate && startDate > endDate) {
            toast({
                id: "invalid-date-range",
                title: "Invalid Date Range",
                description: "Start date cannot be after end date.",
                variant: "destructive",
            });
            return;
        }

        setIsCalculating(true);
        setCalculationError(null);
        setCalculatedOvertimeResult(null);

        try {
            // Format dates to ISO 8601 string for backend
            const startISO = startDate ? format(startDate, "yyyy-MM-dd'T'HH:mm:ss") : '';
            const endISO = endDate ? format(endDate, "yyyy-MM-dd'T'HH:mm:ss") : '';

            const hours = await api.calculateHoursWorked(parseInt(selectedEmployeeId), startISO, endISO);
            setCalculatedOvertimeResult(hours);
            toast({
                id: "calculation-success",
                title: "Calculation Complete",
                description: `Hours worked calculated successfully for employee ID ${selectedEmployeeId}.`,
                variant: "success",
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to calculate hours.";
            setCalculationError(errorMessage);
            toast({
                id: "calculation-error",
                title: "Error",
                description: `Calculation failed: ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setIsCalculating(false);
        }
    };


    // Placeholder for overtime statistics (needs more complex backend logic)
    const overtimeStats = {
        totalEmployeesWithOT: 0,
        totalOvertimeHours: 0,
        totalOvertimePay: 0,
        averageOvertimePerEmployee: 0,
    }

    // You would calculate these stats based on `overtimeRecords`
    // For now, let's just count approved/pending requests
    useEffect(() => {
        if (overtimeRecords.length > 0) {
            const approvedRequests = overtimeRecords.filter(req => req.status === 'APPROVED');
            const pendingRequests = overtimeRecords.filter(req => req.status === 'PENDING');

            // Simple count for demonstration
            overtimeStats.totalEmployeesWithOT = new Set(approvedRequests.map(req => req.employeeId)).size;
            overtimeStats.totalOvertimeHours = approvedRequests.reduce((sum, req) => sum + req.requestedHours, 0);
            // Assuming a flat rate for calculation, e.g., $25/hour for OT
            overtimeStats.totalOvertimePay = overtimeStats.totalOvertimeHours * 25; // Placeholder rate
            overtimeStats.averageOvertimePerEmployee =
                overtimeStats.totalEmployeesWithOT > 0
                    ? overtimeStats.totalOvertimeHours / overtimeStats.totalEmployeesWithOT
                    : 0;
        }
    }, [overtimeRecords]); // Recalculate when records change


    if (employeesLoading || recordsLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xl text-muted-foreground">
                Loading data...
            </div>
        );
    }

    if (employeesError || recordsError) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
                Error loading data: {employeesError || recordsError}
            </div>
        );
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
                        <p className="text-xs text-muted-foreground">Approved this period</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total OT Hours</CardTitle>
                        <ClockIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{overtimeStats.totalOvertimeHours.toFixed(2)}h</div>
                        <p className="text-xs text-muted-foreground">Approved hours</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total OT Pay</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${overtimeStats.totalOvertimePay.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Estimated additional compensation</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average OT/Employee</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{overtimeStats.averageOvertimePerEmployee.toFixed(2)}h</div>
                        <p className="text-xs text-muted-foreground">Avg. approved hours per employee</p>
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
                                <CardTitle>Calculate Employee Hours Worked</CardTitle>
                            </div>
                            <CardDescription>
                                Calculate total hours worked for an employee within a specific period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="employee">Select Employee</Label>
                                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all" disabled>Select a specific employee</SelectItem> {/* Disable "All" for calculation */}
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                                    {emp.firstName} {emp.lastName} (ID: {emp.id})
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

                            {selectedPeriod === "custom" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <DatePicker
                                            date={customStartDate}
                                            setDate={setCustomStartDate}
                                            placeholder="Select start date"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <DatePicker
                                            date={customEndDate}
                                            setDate={setCustomEndDate}
                                            placeholder="Select end date"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleCalculateOvertime}
                                disabled={!selectedEmployeeId || selectedEmployeeId === "all" || isCalculating}
                                className="w-full"
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                {isCalculating ? "Calculating..." : "Calculate Hours Worked"}
                            </Button>

                            {calculatedOvertimeResult !== null && (
                                <Alert className="mt-4">
                                    <Calendar className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Total Hours Worked:</strong> {calculatedOvertimeResult.toFixed(2)} hours
                                        {selectedPeriod === "custom" && customStartDate && customEndDate && (
                                            ` between ${format(customStartDate, "PPP")} and ${format(customEndDate, "PPP")}`
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {calculationError && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Calculation Error:</strong> {calculationError}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overtime Records</CardTitle>
                            <CardDescription>View and manage all submitted overtime requests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {overtimeRecords.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">No overtime records found.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Requested Hours</TableHead>
                                            <TableHead>Request Date</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Status</TableHead>
                                            {/* <TableHead className="text-right">Actions</TableHead> */} {/* Add actions if needed */}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {overtimeRecords.map((ot) => {
                                            const employee = employees.find(emp => emp.id === ot.employeeId);
                                            const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : `Unknown Employee (ID: ${ot.employeeId})`;
                                            const employeeDepartment = employee ? employee.department || 'N/A' : 'N/A';

                                            return (
                                                <TableRow key={ot.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{employeeName}</div>
                                                            <div className="text-sm text-muted-foreground">{employeeDepartment}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-orange-600">{ot.requestedHours.toFixed(2)}h</TableCell>
                                                    <TableCell className="text-sm">{format(new Date(ot.requestDateTime), "PPP p")}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">{ot.reason || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={ot.status === "APPROVED" ? "default" : (ot.status === "REJECTED" ? "destructive" : "secondary")}
                                                            className={
                                                                ot.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                                                    ot.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                                                        "bg-yellow-100 text-yellow-800"
                                                            }
                                                        >
                                                            {ot.status}
                                                        </Badge>
                                                    </TableCell>
                                                    {/* Add action buttons here if you want to allow approving/rejecting from this view */}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
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
