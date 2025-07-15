"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Clock, Calendar } from "lucide-react"

export default function ReportsPage() {
    const [employeeId, setEmployeeId] = useState("")
    const [startDateTime, setStartDateTime] = useState("")
    const [endDateTime, setEndDateTime] = useState("")
    const [totalHours, setTotalHours] = useState<number | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const handleCalculate = () => {
        if (!employeeId || !startDateTime || !endDateTime) {
            return
        }

        setIsCalculating(true)

        // Simulate calculation
        setTimeout(() => {
            // Mock calculation - in real app, this would be based on actual punch data
            const mockHours = Math.floor(Math.random() * 40) + 20 + Math.random()
            setTotalHours(Number.parseFloat(mockHours.toFixed(2)))
            setIsCalculating(false)
        }, 1000)
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Calculate hours worked and generate reports</p>
                </div>
            </div>

            <div className="max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            <CardTitle>Calculate Hours Worked</CardTitle>
                        </div>
                        <CardDescription>Calculate total hours worked for an employee within a specific time range</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="reportEmployeeId">Employee ID</Label>
                            <Input
                                id="reportEmployeeId"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter Employee ID (e.g., EMP001)"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDateTime">Start Date & Time</Label>
                                <Input
                                    id="startDateTime"
                                    type="datetime-local"
                                    value={startDateTime}
                                    onChange={(e) => setStartDateTime(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDateTime">End Date & Time</Label>
                                <Input
                                    id="endDateTime"
                                    type="datetime-local"
                                    value={endDateTime}
                                    onChange={(e) => setEndDateTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCalculate}
                            disabled={!employeeId || !startDateTime || !endDateTime || isCalculating}
                            className="w-full"
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            {isCalculating ? "Calculating..." : "Calculate Hours"}
                        </Button>

                        {totalHours !== null && (
                            <Alert className="border-green-200 bg-green-50">
                                <Clock className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    <strong>Total Hours Worked:</strong> {totalHours} hours
                                    <br />
                                    <span className="text-sm">
                    Employee {employeeId} from {new Date(startDateTime).toLocaleString()} to{" "}
                                        {new Date(endDateTime).toLocaleString()}
                  </span>
                                </AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <Calendar className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Date Format Instructions:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Use the date/time picker above for easy selection</li>
                                    <li>• Or enter manually in format: YYYY-MM-DD HH:MM:SS</li>
                                    <li>• Example: 2024-01-15 09:00:00</li>
                                    <li>• Ensure end time is after start time</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Reports</CardTitle>
                        <CardDescription>Generate common reports with one click</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-16 flex-col bg-transparent">
                                <Clock className="h-6 w-6 mb-2" />
                                Today's Hours
                            </Button>
                            <Button variant="outline" className="h-16 flex-col bg-transparent">
                                <Calendar className="h-6 w-6 mb-2" />
                                Weekly Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
