"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns" // ⭐ Added parseISO for date handling ⭐
import { AlertCircle, CheckCircle, XCircle, Loader2, ArrowLeftIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081"

// ⭐ Corrected and expanded data interfaces ⭐
interface OvertimeRequestResponse {
    id: number
    employeeId: number
    employeeName: string
    overtimeDate: string
    requestedHours: number
    reason: string
    status: "PENDING" | "APPROVED" | "DENIED" // This needs to be consistent with your backend
    submissionDate: string // The correct field for sorting
    comments: string | null // ⭐ Added the missing 'comments' field ⭐
}

interface UserInfo {
    id: number // User ID from the backend
    email: string
    role: string
    employeeId: number | null
    firstName?: string
    lastName?: string
    department?: string
    authToken: string
}

// Reusable function to get user info and token
const getAuthUser = async (): Promise<UserInfo | null> => {
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
            localStorage.setItem("userRole", userData.role)
            localStorage.setItem("employeeId", userData.employeeId ? String(userData.employeeId) : '')
            localStorage.setItem("firstName", userData.firstName || '')
            localStorage.setItem("lastName", userData.lastName || '')
            localStorage.setItem("department", userData.department || '')
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

export default function AdminOvertimePage() {
    const router = useRouter()
    const { toast } = useToast()

    const [user, setUser] = useState<UserInfo | null>(null)
    const [allOvertimeRequests, setAllOvertimeRequests] = useState<OvertimeRequestResponse[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadPage = async () => {
            setIsLoadingData(true)
            const authUser = await getAuthUser()

            if (!authUser || authUser.role.toUpperCase() !== "ADMIN") {
                toast({
                    id: "access-denied",
                    title: "Access Denied",
                    description: "You do not have administrative privileges to view this page.",
                    variant: "destructive",
                })
                router.push("/login")
                return
            }
            setUser(authUser)
            await fetchAllOvertimeRequests(authUser.authToken)
            setIsLoadingData(false)
        }

        loadPage()
    }, [router, toast])

    // ⭐ Corrected Fetch all overtime requests function ⭐
    const fetchAllOvertimeRequests = async (token: string) => {
        setError(null)
        try {
            // ⭐ Corrected endpoint to fetch ALL requests from the admin dashboard controller ⭐
            const response = await fetch(`${BACKEND_API_BASE_URL}/api/overtime/admin/pending`, { // Assumes a new endpoint /admin/all
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || "Failed to fetch all overtime requests.")
                } else {
                    throw new Error(`Failed to fetch requests: Server responded with status ${response.status}.`);
                }
            }
            const data: OvertimeRequestResponse[] = await response.json()

            // ⭐ Sort by PENDING first, then by submission date (most recent first) ⭐
            const sortedData = data.sort((a, b) => {
                const aIsPending = a.status === "PENDING";
                const bIsPending = b.status === "PENDING";

                if (aIsPending && !bIsPending) return -1;
                if (!aIsPending && bIsPending) return 1;

                // If both have the same status, sort by submission date
                return parseISO(b.submissionDate).getTime() - parseISO(a.submissionDate).getTime();
            });

            setAllOvertimeRequests(sortedData)
        } catch (err) {
            console.error("Error fetching overtime requests:", err);
            setError(err instanceof Error ? err.message : "An unexpected error occurred while fetching requests.")
            toast({
                id: "admin-overtime-fetch-error",
                title: "Error fetching requests",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            })
        } finally {
            setIsLoadingData(false)
        }
    }


    const handleStatusUpdate = async (requestId: number, newStatus: "APPROVED" | "DENIED") => {
        const token = user?.authToken;
        if (!token) {
            toast({
                id: "authentication-error",
                title: "Authentication Error",
                description: "Authentication token missing. Please log in again.",
                variant: "destructive",
            });
            router.push("/login");
            return;
        }

        try {
            const endpoint = newStatus === "APPROVED" ? "approve" : "reject";
            const url = `${BACKEND_API_BASE_URL}/api/overtime/admin/${endpoint}/${requestId}`;

            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Server responded with status ${response.status}`);
            }

            // ⭐ The request was successful, so we re-fetch all requests from the backend ⭐
            await fetchAllOvertimeRequests(token);

            toast({
                id: "admin-overtime-status-update",
                title: "Status Updated!",
                description: `Request ${requestId} has been ${newStatus}.`,
            });

        } catch (err) {
            console.error("Status update failed:", err);
            toast({
                id: "admin-overtime-status-update-error",
                title: "Status Update Failed",
                description: err instanceof Error ? err.message : "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p>Loading overtime requests...</p>
                </div>
            </div>
        )
    }

    // ⭐ Combined error and no requests state ⭐
    const noRequestsOrError = allOvertimeRequests.length === 0 || error;

    return (
        <div className="flex-1 space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin-dashboard">
                        <Button variant="ghost" size="sm">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight">
                            Overtime Management
                        </h1>
                        <p className="text-muted-foreground font-body">
                            Review and manage all submitted overtime requests.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="w-full border-0 shadow-modern">
                <CardHeader>
                    <CardTitle className="text-xl font-display">All Overtime Requests</CardTitle>
                    <CardDescription className="font-body">Overview of all requests awaiting action or completed.</CardDescription>
                </CardHeader>
                <CardContent>
                    {allOvertimeRequests.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">No overtime requests found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Overtime Date</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allOvertimeRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.employeeName || `Employee ID: ${request.employeeId}`}</TableCell>
                                            <TableCell>{format(parseISO(request.overtimeDate), "MMM dd, yyyy")}</TableCell>
                                            <TableCell>{request.requestedHours}</TableCell>
                                            <TableCell>{request.reason}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    request.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                                        request.status === "DENIED" ? "bg-red-100 text-red-800" :
                                                            "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status === "PENDING" ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "APPROVED")}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "DENIED")}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" /> Deny
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No action needed</span>
                                                )}
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