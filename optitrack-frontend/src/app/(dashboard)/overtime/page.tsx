"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalendarIcon, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils" // Assuming you have a utility for class names
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast" // Assuming you have shadcn's useToast hook

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// Define interfaces for data structures
interface OvertimeRequest {
    id: number
    employeeId: number // Backend might return employee ID directly or nested employee object
    employeeName: string // If backend sends employee name
    requestDateTime: string // ISO date string
    requestedHours: number
    reason: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    submittedAt: string // ISO date string
    adminNotes?: string
}

interface User {
    id: string | number
    name: string
    role: string
    department?: string
}

export default function OvertimePage() {
    const router = useRouter()
    const { toast } = useToast()

    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [employeeId, setEmployeeId] = useState<string | number | null>(null)
    const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([])
    const [isLoadingRequests, setIsLoadingRequests] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [requestDate, setRequestDate] = useState<Date | undefined>(undefined)
    const [requestTime, setRequestTime] = useState<string>("")
    const [requestedHours, setRequestedHours] = useState<number | string>("")
    const [reason, setReason] = useState<string>("")

    // Authentication check and user loading
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("currentUser")
            const storedEmployeeId = localStorage.getItem("employeeId")

            if (!storedUser || !storedEmployeeId) {
                router.push("/login")
                return
            }
            const userData: User = JSON.parse(storedUser)
            setCurrentUser(userData)
            setEmployeeId(storedEmployeeId)
        }
    }, [router])

    // Fetch overtime requests when employeeId is available
    useEffect(() => {
        const fetchOvertimeRequests = async () => {
            if (!employeeId) return

            setIsLoadingRequests(true)
            setError(null)
            try {
                const token = localStorage.getItem("authToken")
                const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime-requests/employee/${employeeId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`, // Include JWT token
                    },
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch overtime requests.")
                }
                const data: OvertimeRequest[] = await response.json()

                // Sort by submittedAt descending (most recent first)
                const sortedData = data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
                setOvertimeRequests(sortedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching requests.")
                toast({
                    id: "overtime-request-fetch-error",
                    title: "Error fetching requests",
                    description: err instanceof Error ? err.message : "An unexpected error occurred.",
                    variant: "destructive",
                })
            } finally {
                setIsLoadingRequests(false)
            }
        }

        if (employeeId) {
            fetchOvertimeRequests()
        }
    }, [employeeId, toast]) // Re-fetch when employeeId changes (e.g., on first load)

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        if (!currentUser || !employeeId) {
            setError("User not authenticated. Please log in again.")
            toast({
                id: "overtime-request-authentication-error",
                title: "Authentication Error",
                description: "User not authenticated. Please log in again.",
                variant: "destructive",
            })
            setIsSubmitting(false)
            return
        }

        if (!requestDate || !requestTime || !requestedHours || !reason.trim()) {
            setError("Please fill in all required fields.")
            toast({
                id: "overtime-request-validation-error",
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            setIsSubmitting(false)
            return
        }

        // Combine date and time
        const [hours, minutes] = requestTime.split(":").map(Number);
        const combinedDateTime = new Date(requestDate);
        combinedDateTime.setHours(hours);
        combinedDateTime.setMinutes(minutes);
        combinedDateTime.setSeconds(0);
        combinedDateTime.setMilliseconds(0);

        // Format to ISO 8601 string for backend (e.g., "2023-10-27T10:30:00")
        const requestDateTimeISO = combinedDateTime.toISOString().slice(0, 19); // YYYY-MM-DDTHH:MM:SS

        try {
            const token = localStorage.getItem("authToken")
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Include JWT token
                },
                body: JSON.stringify({
                    employeeId: Number(employeeId), // Ensure it's a number
                    requestDateTime: requestDateTimeISO,
                    requestedHours: Number(requestedHours), // Ensure it's a number
                    reason: reason.trim(),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to submit overtime request.")
            }

            const newRequest: OvertimeRequest = await response.json()
            setOvertimeRequests(prev => [newRequest, ...prev].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()))

            // Clear form
            setRequestDate(undefined)
            setRequestTime("")
            setRequestedHours("")
            setReason("")

            toast({
                id: "overtime-request-submitted",
                title: "Request Submitted!",
                description: "Your overtime request has been successfully submitted.",
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred during submission.")
            toast({
                id: "overtime-request-submission-error",
                title: "Submission Failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!currentUser || !employeeId) {
        return <div className="p-8 text-center">Loading user data...</div>
    }

    return (
        <div className="flex flex-col gap-6 p-8">
            <h1 className="text-3xl font-bold font-display">Overtime Requests</h1>
            <p className="text-md text-muted-foreground font-body">
                Submit new overtime requests and view your request history.
            </p>

            {/* Submit New Request Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl font-display">Submit New Overtime Request</CardTitle>
                    <CardDescription className="font-body">Fill out the form to request overtime hours.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Request Date */}
                            <div className="space-y-2">
                                <Label htmlFor="requestDate">Date of Overtime</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !requestDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {requestDate ? format(requestDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={requestDate} // Make sure this is correctly bound to your state
                                            onSelect={setRequestDate} // Make sure this is correctly bound to your state setter
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Request Time */}
                            <div className="space-y-2">
                                <Label htmlFor="requestTime">Time of Overtime (HH:MM)</Label>
                                <Input
                                    id="requestTime"
                                    type="time"
                                    value={requestTime}
                                    onChange={(e) => setRequestTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Requested Hours */}
                        <div className="space-y-2">
                            <Label htmlFor="requestedHours">Requested Hours</Label>
                            <Input
                                id="requestedHours"
                                type="number"
                                value={requestedHours}
                                onChange={(e) => setRequestedHours(e.target.value)}
                                placeholder="e.g., 2.5"
                                step="0.5"
                                min="0.5"
                                required
                            />
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Overtime</Label>
                            <Input
                                id="reason"
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly describe why overtime is needed"
                                required
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Overtime Request History Card */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-xl font-display">Your Overtime Request History</CardTitle>
                    <CardDescription className="font-body">Review the status of your past requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingRequests ? (
                        <div className="text-center p-4">Loading requests...</div>
                    ) : overtimeRequests.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">No overtime requests submitted yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Date</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Submitted On</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overtimeRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(request.requestDateTime), "MMM dd, yyyy @ HH:mm")}
                                            </TableCell>
                                            <TableCell>{request.requestedHours}</TableCell>
                                            <TableCell>{request.reason}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    request.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                                        request.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                                            "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {format(new Date(request.submittedAt), "MMM dd, yyyy")}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}