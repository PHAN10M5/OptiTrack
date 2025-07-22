"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, UserCheck, UserX, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PunchPage() {
    const [employeeId, setEmployeeId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [lastPunch, setLastPunch] = useState<{
        type: "in" | "out"
        time: string
        employee: string
    } | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleClockIn = async () => {
        if (!employeeId.trim()) {
            toast({
                id: "validation-error",
                title: "Error",
                description: "Please enter an Employee ID.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            const now = new Date()
            setLastPunch({
                type: "in",
                time: now.toLocaleString(),
                employee: employeeId,
            })

            toast({
                id: "clock-in-success",
                title: "Clock-in Successful!",
                description: `Employee ${employeeId} clocked in at ${now.toLocaleTimeString()}`,
            })

            setIsLoading(false)
            setEmployeeId("")
        }, 1000)
    }

    const handleClockOut = async () => {
        if (!employeeId.trim()) {
            toast({
                id: "validation-error",
                title: "Error",
                description: "Please enter an Employee ID.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            const now = new Date()
            setLastPunch({
                type: "out",
                time: now.toLocaleString(),
                employee: employeeId,
            })

            toast({
                id: "clock-out-success",
                title: "Clock-out Successful!",
                description: `Employee ${employeeId} clocked out at ${now.toLocaleTimeString()}`,
            })

            setIsLoading(false)
            setEmployeeId("")
        }, 1000)
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
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter your Employee ID (e.g., EMP001)"
                                className="text-center text-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                onClick={handleClockIn}
                                disabled={isLoading}
                                size="lg"
                                className="h-16 text-lg bg-green-600 hover:bg-green-700"
                            >
                                <UserCheck className="mr-2 h-6 w-6" />
                                Clock In
                            </Button>

                            <Button
                                onClick={handleClockOut}
                                disabled={isLoading}
                                size="lg"
                                variant="destructive"
                                className="h-16 text-lg"
                            >
                                <UserX className="mr-2 h-6 w-6" />
                                Clock Out
                            </Button>
                        </div>

                        {lastPunch && (
                            <Alert className={lastPunch.type === "in" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                                <CheckCircle className={`h-4 w-4 ${lastPunch.type === "in" ? "text-green-600" : "text-red-600"}`} />
                                <AlertDescription className="font-medium">
                                    Last Action: Employee {lastPunch.employee} clocked {lastPunch.type} at {lastPunch.time}
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
