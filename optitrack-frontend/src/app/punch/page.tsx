"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, UserCheck, UserX, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api" // Import API service
import { Punch, Employee } from "@/types" // Import Punch and Employee types

export default function PunchPage() {
    const [employeeId, setEmployeeId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [lastPunch, setLastPunch] = useState<Punch | null>(null)
    const [lastPunchEmployeeName, setLastPunchEmployeeName] = useState<string | null>(null)
    const { toast } = useToast()

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Function to fetch employee name
    const fetchEmployeeName = async (id: number) => {
        try {
            const employee: Employee = await api.getEmployeeById(id)
            return `${employee.firstName} ${employee.lastName}`
        } catch (err) {
            console.error(`Failed to fetch employee name for ID ${id}:`, err)
            return `ID: ${id}` // Fallback to ID if name cannot be fetched
        }
    }

    const handlePunch = async (punchType: 'IN' | 'OUT') => {
        if (!employeeId.trim()) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "Please enter an Employee ID.",
                variant: "destructive",
            })
            return
        }

        const id = parseInt(employeeId)
        if (isNaN(id)) {
            toast({
                id: "validation-error",
                title: "Validation Error",
                description: "Employee ID must be a number.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        setLastPunch(null); // Clear previous punch status
        setLastPunchEmployeeName(null);

        try {
            let responsePunch: Punch;
            if (punchType === 'IN') {
                responsePunch = await api.clockIn({ employeeId: id });
            } else {
                responsePunch = await api.clockOut({ employeeId: id });
            }

            setLastPunch(responsePunch);
            const name = await fetchEmployeeName(responsePunch.employeeId);
            setLastPunchEmployeeName(name);

            toast({
                id: "success",
                title: `Clock-${punchType === 'IN' ? 'in' : 'out'} Successful!`,
                description: `Employee ${name} (ID: ${id}) clocked ${punchType.toLowerCase()} at ${new Date(responsePunch.timestamp).toLocaleTimeString()}.`,
                variant: "success",
            });

            setEmployeeId(""); // Clear input on success

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || `Failed to clock ${punchType.toLowerCase()}.`;
            console.error(`Error clocking ${punchType.toLowerCase()}:`, err);

            toast({
                id: "error",
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clock In / Clock Out</h1>
                    <p className="text-muted-foreground">Employee time tracking system</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                            <Clock className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Time Punch System</CardTitle>
                        <CardDescription>Enter your Employee ID and select your action</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                type="number" // Ensure numeric input
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter your Employee ID (e.g., 101)"
                                className="text-center text-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={() => handlePunch('IN')}
                                disabled={isLoading}
                                size="lg"
                                className="h-16 text-lg bg-green-600 hover:bg-green-700"
                            >
                                <UserCheck className="mr-2 h-6 w-6" />
                                Clock In
                            </Button>

                            <Button
                                onClick={() => handlePunch('OUT')}
                                disabled={isLoading}
                                size="lg"
                                variant="destructive"
                                className="h-16 text-lg"
                            >
                                <UserX className="mr-2 h-6 w-6" />
                                Clock Out
                            </Button>
                        </div>

                        {lastPunch && lastPunchEmployeeName && (
                            <Alert className={lastPunch.punchType === "IN" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                                <CheckCircle className={`h-4 w-4 ${lastPunch.punchType === "IN" ? "text-green-600" : "text-red-600"}`} />
                                <AlertDescription className="font-medium">
                                    Last Action: Employee {lastPunchEmployeeName} (ID: {lastPunch.employeeId}) clocked {lastPunch.punchType.toLowerCase()} at {new Date(lastPunch.timestamp).toLocaleTimeString()}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Instructions:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Enter your Employee ID in the field above</li>
                                    <li>• Click "Clock In" when starting your shift</li>
                                    <li>• Click "Clock Out" when ending your shift</li>
                                    <li>• You will receive confirmation of each action</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Current Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center space-y-2">
                            <div className="text-3xl font-mono font-bold">{currentTime.toLocaleTimeString()}</div>
                            <div className="text-muted-foreground">
                                {currentTime.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
