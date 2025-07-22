"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Clock,
    UserCheck,
    UserX,
    Filter,
    Download,
    Calendar,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

// Define your backend API base URL
const BACKEND_API_BASE_URL = "http://localhost:8081";

// --- Interfaces for Backend Data ---
interface AuthenticatedUser {
    id: number;
    email: string;
    role: string;
    employeeId?: number;
    firstName?: string;
    lastName?: string;
}

interface PunchRecord {
    id: number;
    employeeId: number;
    employeeName: string; // Will be added on frontend based on fetched employees
    department: string; // Will be added on frontend
    punchType: "IN" | "OUT";
    timestamp: string; // ISO 8601 string
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    department: string;
}

// --- Helper Functions (Auth, Token) ---

const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("authToken");
    }
    return null;
};

const getAuthUser = async (token: string): Promise<AuthenticatedUser | null> => {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const storedUser = localStorage.getItem("currentUser");
        const storedRole = localStorage.getItem("userRole");
        const storedEmployeeId = localStorage.getItem("employeeId");
        const storedFirstName = localStorage.getItem("firstName");
        const storedLastName = localStorage.getItem("lastName");

        if (storedUser && storedRole) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.id && parsedUser.email && parsedUser.role) {
                return {
                    id: parsedUser.id,
                    email: parsedUser.email,
                    role: storedRole,
                    employeeId: storedEmployeeId ? parseInt(storedEmployeeId) : undefined,
                    firstName: storedFirstName || parsedUser.firstName,
                    lastName: storedLastName || parsedUser.lastName,
                };
            }
        }
    } catch (e) {
        console.error("Error parsing stored user data from localStorage:", e);
    }

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(
                "Failed to fetch user info from /api/auth/me:",
                response.status,
                await response.text()
            );
            return null;
        }

        const userData: AuthenticatedUser = await response.json();
        if (userData.id && userData.role && userData.email) {
            return userData;
        } else {
            console.error("/api/auth/me did not return expected user fields:", userData);
            return null;
        }
    } catch (error) {
        console.error("Error fetching auth user from API:", error);
        return null;
    }
};

export default function PunchLogsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [punches, setPunches] = useState<PunchRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredPunches, setFilteredPunches] = useState<PunchRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<AuthenticatedUser | null>(null);

    // --- Initial Data Load & Authentication Check ---
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const token = getToken();

            if (!token) {
                toast({
                    id: "not-authenticated",
                    title: "Not Authenticated",
                    description: "Please log in to view punch logs.",
                    variant: "destructive",
                });
                router.push("/login");
                setIsLoading(false);
                return;
            }

            const currentUser = await getAuthUser(token);

            if (!currentUser) {
                toast({
                    id: "authentication-failed",
                    title: "Authentication Failed",
                    description: "Could not retrieve user details. Please log in again.",
                    variant: "destructive",
                });
                localStorage.removeItem("authToken");
                router.push("/login");
                setIsLoading(false);
                return;
            }

            if (currentUser.role.toUpperCase() !== "ADMIN") {
                toast({
                    id: "access-denied",
                    title: "Access Denied",
                    description: "You do not have permission to view punch logs.",
                    variant: "destructive",
                });
                router.push("/employee-dashboard");
                setIsLoading(false);
                return;
            }

            setUser(currentUser);
            await fetchAllData(token);
            setIsLoading(false);
        };

        loadData();
    }, [router, toast]);

    // --- Fetch All Necessary Data (Punches, Employees) ---
    const fetchAllData = useCallback(async (token: string) => {
        try {
            // Fetch Employees from /api/employees/all
            const employeesResponse = await fetch(
                `${BACKEND_API_BASE_URL}/api/employees/all`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!employeesResponse.ok) {
                throw new Error(`Failed to fetch employees: ${employeesResponse.statusText}`);
            }
            const fetchedEmployees: Employee[] = await employeesResponse.json();
            setEmployees(fetchedEmployees);

            // --- UPDATED: Fetch Punches from the new /api/admin/punches/all endpoint ---
            const punchesResponse = await fetch(
                `${BACKEND_API_BASE_URL}/api/admin/punches/all`, // <--- THIS IS THE UPDATED ENDPOINT
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!punchesResponse.ok) {
                throw new Error(`Failed to fetch punches: ${punchesResponse.statusText}`);
            }
            const fetchedPunches: PunchRecord[] = await punchesResponse.json();

            const punchesWithNames = fetchedPunches.map((punch) => {
                const employee = fetchedEmployees.find((emp) => emp.id === punch.employeeId);
                return {
                    ...punch,
                    employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee",
                    department: employee ? employee.department : "Unknown",
                };
            }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setPunches(punchesWithNames);
            setFilteredPunches(punchesWithNames);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast({
                id: "error-loading-data",
                title: "Error Loading Data",
                description: error.message || "Could not retrieve punch logs or employee data.",
                variant: "destructive",
            });
            setPunches([]);
            setFilteredPunches([]);
        }
    }, [toast]);

    // --- Apply Filters Effect ---
    useEffect(() => {
        let filtered = punches;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (punch) =>
                    punch.employeeName.toLowerCase().includes(lowerCaseSearchTerm) ||
                    String(punch.employeeId).includes(lowerCaseSearchTerm) ||
                    punch.department.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (selectedEmployee !== "all") {
            filtered = filtered.filter((punch) => String(punch.employeeId) === selectedEmployee);
        }

        if (selectedType !== "all") {
            filtered = filtered.filter((punch) => punch.punchType.toUpperCase() === selectedType.toUpperCase());
        }

        if (dateFilter) {
            filtered = filtered.filter((punch) =>
                format(parseISO(punch.timestamp), "yyyy-MM-dd") === dateFilter
            );
        }

        setFilteredPunches(filtered);
    }, [searchTerm, selectedEmployee, selectedType, dateFilter, punches]);

    // --- Clear Filters Function ---
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedEmployee("all");
        setSelectedType("all");
        setDateFilter("");
    };

    // --- Export Data Function ---
    const exportData = () => {
        const headers = [
            "Punch ID",
            "Employee ID",
            "Employee Name",
            "Department",
            "Type",
            "Timestamp",
        ];
        const csvContent = [
            headers.join(","),
            ...filteredPunches.map((punch) =>
                [
                    punch.id,
                    punch.employeeId,
                    `"${punch.employeeName}"`,
                    `"${punch.department}"`,
                    punch.punchType,
                    punch.timestamp,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `punch-logs-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // --- Stats Calculation ---
    const stats = {
        totalPunches: filteredPunches.length,
        clockIns: filteredPunches.filter((p) => p.punchType === "IN").length,
        clockOuts: filteredPunches.filter((p) => p.punchType === "OUT").length,
        uniqueEmployees: new Set(filteredPunches.map((p) => p.employeeId)).size,
    };

    // --- Render Loading State ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-lg text-muted-foreground">Loading punch logs...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Punch Logs</h1>
                    <p className="text-muted-foreground">
                        View and analyze all employee punch records
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => fetchAllData(getToken()!)}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={exportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Punches</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPunches}</div>
                        <p className="text-xs text-muted-foreground">All punch records</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clock Ins</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.clockIns}
                        </div>
                        <p className="text-xs text-muted-foreground">IN punches</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clock Outs</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.clockOuts}
                        </div>
                        <p className="text-xs text-muted-foreground">OUT punches</p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-modern">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unique Employees
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.uniqueEmployees}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Employees with punches
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Filter Punch Records</CardTitle>
                            <CardDescription>
                                Use filters to find specific punch records
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={clearFilters} size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by name, ID, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee">Employee</Label>
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                            {emp.firstName} {emp.lastName} ({emp.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Punch Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="IN">Clock In</SelectItem>
                                    <SelectItem value="OUT">Clock Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Punch Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Punch Records</CardTitle>
                    <CardDescription>
                        {filteredPunches.length} of {punches.length} punch records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p>Loading punch records...</p>
                        </div>
                    ) : filteredPunches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                No Punch Records Found
                            </h3>
                            <p>No punch records match your current filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Punch ID</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPunches.map((punch) => (
                                        <TableRow key={punch.id}>
                                            <TableCell className="font-medium">{punch.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {punch.employeeName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {punch.employeeId}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{punch.department}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        punch.punchType === "IN" ? "default" : "secondary"
                                                    }
                                                    className={
                                                        punch.punchType === "IN"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }
                                                >
                                                    {punch.punchType === "IN" ? (
                                                        <UserCheck className="mr-1 h-3 w-3" />
                                                    ) : (
                                                        <UserX className="mr-1 h-3 w-3" />
                                                    )}
                                                    {punch.punchType === "IN" ? "Clock In" : "Clock Out"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {format(parseISO(punch.timestamp), "MMM d, yyyy")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {format(parseISO(punch.timestamp), "h:mm:ss a")}
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
    );
}