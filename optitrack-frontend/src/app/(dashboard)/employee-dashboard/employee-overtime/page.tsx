"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { format, parseISO } from "date-fns"
import { ClockIcon, PlusIcon, HourglassIcon, CheckIcon, XIcon, ArrowLeftIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// Consistent authentication and user fetching
interface AuthenticatedUser {
    id: number // User entity ID
    email: string
    role: string
    employeeId: number // Employee entity ID, critical for employee role
    firstName?: string
    lastName?: string
    department?: string
    authToken: string // The JWT token
}

const getAuthUser = async (): Promise<AuthenticatedUser | null> => {
    if (typeof window === "undefined") {
        return null
    }

    const token = localStorage.getItem("authToken")
    if (!token) return null

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            localStorage.removeItem("authToken")
            return null
        }

        const userData = await response.json()
        if (userData.id && userData.role && userData.email) {
            return {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                employeeId: userData.employeeId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                department: userData.department,
                authToken: token,
            }
        } else {
            return null
        }
    } catch (error) {
        console.error("Error fetching auth user from API:", error)
        return null
    }
}

interface OvertimeRequestResponse {
    id: number
    employeeId: number
    requestDate: string
    overtimeDate: string;
    requestedHours: number
    reason: string
    status: "PENDING" | "APPROVED" | "DENIED"
    comments: string | null
    submissionDate: string
}

export default function EmployeeOvertimePage() {
    const [user, setUser] = useState<AuthenticatedUser | null>(null)
    const [pendingRequests, setPendingRequests] = useState<OvertimeRequestResponse[]>([])
    const [approvedRequests, setApprovedRequests] = useState<OvertimeRequestResponse[]>([]) // New state for approved requests
    const [hours, setHours] = useState("")
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()
    const [overtimeDate, setOvertimeDate] = useState(format(new Date(), "yyyy-MM-dd"))

    // Function to fetch ONLY pending requests
    const fetchPendingRequests = async (employeeId: number, token: string) => {
        setError(null)
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime/employee/pending`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Failed to fetch pending requests: ${response.statusText}`)
            }

            const data: OvertimeRequestResponse[] = await response.json()
            setPendingRequests(data)
        } catch (err) {
            console.error("Error fetching pending requests:", err)
            setError(err instanceof Error ? err.message : "An error occurred while loading pending requests.")
        }
    }

    // New function to fetch ONLY approved requests
    const fetchApprovedRequests = async (employeeId: number, token: string) => {
        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime/employee/approved`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `Failed to fetch approved requests: ${response.statusText}`)
            }

            const data: OvertimeRequestResponse[] = await response.json()
            setApprovedRequests(data)
        } catch (err) {
            console.error("Error fetching approved requests:", err)
        }
    }


    useEffect(() => {
        const loadPage = async () => {
            setIsLoading(true)
            const authUser = await getAuthUser()

            if (!authUser || authUser.role.toUpperCase() !== "EMPLOYEE" || !authUser.employeeId) {
                toast({
                    id: "access-denied",
                    title: "Access Denied",
                    description: "You do not have employee privileges to view this page.",
                    variant: "destructive",
                })
                router.push("/login")
                setIsLoading(false)
                return
            }

            setUser(authUser)
            // Call both fetching functions
            await Promise.all([
                fetchPendingRequests(authUser.employeeId, authUser.authToken),
                fetchApprovedRequests(authUser.employeeId, authUser.authToken)
            ])

            setIsLoading(false)
        }
        loadPage()
    }, [router, toast])


    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !user.employeeId) {
            toast({
                id: "authentication-error",
                title: "Authentication Error",
                description: "User not authenticated. Please log in.",
                variant: "destructive",
            })
            return
        }

        if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
            toast({
                id: "invalid-input",
                title: "Invalid Input",
                description: "Please enter a valid number of hours.",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime/request`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user.authToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeId: user.employeeId,
                    requestedHours: parseFloat(hours),
                    reason: reason,
                    overtimeDate: overtimeDate,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to submit overtime request.")
            }

            toast({
                id: "request-submitted",
                title: "Request Submitted!",
                description: "Your overtime request has been sent for approval.",
            })

            setHours("")
            setReason("")
            // Refresh both lists after a new submission
            await fetchPendingRequests(user.employeeId, user.authToken)
            await fetchApprovedRequests(user.employeeId, user.authToken)

        } catch (err) {
            console.error("Error submitting request:", err)
            toast({
                id: "submission-failed",
                title: "Submission Failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><HourglassIcon className="mr-1 h-3 w-3" />Pending</Badge>
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckIcon className="mr-1 h-3 w-3" />Approved</Badge>
            case "DENIED":
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><XIcon className="mr-1 h-3 w-3" />Denied</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p>Loading overtime page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/employee-dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">
                            My Overtime
                        </h1>
                        <p className="text-muted-foreground font-body">
                            Manage your overtime requests and view your status.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Submission Form */}
                    <Card className="shadow-modern border-0">
                        <CardHeader>
                            <CardTitle className="font-heading flex items-center gap-2">
                                <PlusIcon className="h-5 w-5 text-purple-600" />
                                Submit New Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hours">Hours Requested</Label>
                                        <Input
                                            id="hours"
                                            type="number"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="overtimeDate">Overtime Date</Label>
                                        <Input
                                            id="overtimeDate"
                                            type="date"
                                            value={overtimeDate}
                                            onChange={(e) => setOvertimeDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Overtime</Label>
                                    <Textarea
                                        id="reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Briefly describe the reason for your overtime request..."
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <PlusIcon className="mr-2 h-4 w-4" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pending & Recent Requests */}
                    <Card className="shadow-modern border-0">
                        <CardHeader>
                            <CardTitle className="font-heading flex items-center gap-2">
                                <HourglassIcon className="h-5 w-5 text-orange-600" />
                                Your Pending & Recent Requests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingRequests.length === 0 && approvedRequests.length === 0 ? (
                                <Alert className="bg-gray-50">
                                    <AlertTitle>No Overtime Requests</AlertTitle>
                                    <AlertDescription>
                                        You have no pending or recent overtime requests.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="space-y-4">
                                    {[...pendingRequests, ...approvedRequests].sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()).map((request) => (
                                        <Card key={request.id} className="p-4 shadow-sm">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-muted-foreground">Overtime Date: {format(parseISO(request.overtimeDate), "MMM d, yyyy")}</p>
                                                    <p className="text-lg font-bold">Hours Requested: {request.requestedHours}</p>
                                                    <p className="text-sm text-gray-700">{request.reason}</p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {renderStatusBadge(request.status)}
                                                </div>
                                            </div>
                                            {request.comments && (
                                                <Alert className="mt-4">
                                                    <AlertTitle>Manager Comment</AlertTitle>
                                                    <AlertDescription>{request.comments}</AlertDescription>
                                                </Alert>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Overtime Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-modern border-0">
                        <CardHeader>
                            <CardTitle className="font-heading flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-blue-600" />
                                Overtime Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Approved Hours:</span>
                                <span className="text-lg font-bold">
                                    {approvedRequests.reduce((sum, req) => sum + req.requestedHours, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Pending Hours:</span>
                                <span className="text-lg font-bold">
                                    {pendingRequests.reduce((sum, req) => sum + req.requestedHours, 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Total Overtime Pay:</span>
                                <span className="text-lg font-bold">$0.00</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This section will be updated once your requests are processed.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}