"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, UserCheck, UserX, Plus, Timer, ClockIcon, DollarSign } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import * as api from "@/api/api" // Import API service
import { Employee, Punch, OvertimeRequest } from "@/types" // Import types

// Define the type for a recent activity item
interface RecentActivityItem {
  id: number;
  employee: string;
  action: string;
  time: string;
  type: "in" | "out";
}

export default function Dashboard() {
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())

  // State for fetched data
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [clockedInCount, setClockedInCount] = useState(0)
  const [clockedOutCount, setClockedOutCount] = useState(0)
  const [overtimeHoursTotal, setOvertimeHoursTotal] = useState(0)
  const [overtimePayTotal, setOvertimePayTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define a constant for overtime pay rate (e.g., $25 per hour)
  const OVERTIME_PAY_RATE_PER_HOUR = 25.0;

  // --- Sections that require new backend endpoints for real data ---
  // To get "Today's Punches" accurately, a backend endpoint like /api/punches/today
  // or /api/punches?date=YYYY-MM-DD would be needed.
  const [todayPunches] = useState(0); // Set to 0, as it's not fetched dynamically yet

  // To get "Recent Activity" (latest punches across all employees), a backend endpoint
  // like /api/punches/recent?limit=X would be ideal.
  // Explicitly type the array to resolve TypeScript errors.
  const [recentActivity] = useState<RecentActivityItem[]>([]); // Set to empty array, as it's not fetched dynamically yet
  // --- End Sections that require new backend endpoints ---


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch Employees
        const employees: Employee[] = await api.getEmployees()
        setTotalEmployees(employees.length)

        // Calculate Clocked In/Out Status
        // This currently performs N+1 queries (1 for all employees, then N for each employee's punches).
        // For larger datasets, a dedicated backend endpoint like /api/employees/status
        // that returns all employees with their last punch status would be more efficient.
        let inCount = 0
        let outCount = 0
        for (const emp of employees) {
          try {
            const punches: Punch[] = await api.getPunchesByEmployeeId(emp.id)
            if (punches.length > 0) {
              // Find the last punch by timestamp
              const lastPunch = punches.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
              if (lastPunch.punchType === "IN") {
                inCount++
              } else {
                outCount++
              }
            } else {
              outCount++; // Assume not clocked in if no punches
            }
          } catch (punchErr: any) {
            // Log warning but don't block dashboard load if one employee's punches fail
            console.warn(`Could not fetch punches for employee ID ${emp.id}: ${punchErr.message}`);
            outCount++; // Default to clocked out if punches can't be retrieved
          }
        }
        setClockedInCount(inCount)
        setClockedOutCount(outCount)

        // Fetch Overtime Requests
        const overtimeRequests: OvertimeRequest[] = await api.getOvertimeRequests()
        const approvedOvertime = overtimeRequests.filter(req => req.status === "APPROVED")
        const totalOvertimeHours = approvedOvertime.reduce((sum, req) => sum + req.requestedHours, 0)
        setOvertimeHoursTotal(totalOvertimeHours)

        // Calculate total overtime pay based on the defined rate
        setOvertimePayTotal(totalOvertimeHours * OVERTIME_PAY_RATE_PER_HOUR)

      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch dashboard data.";
        setError(errorMessage)
        toast({
          id: "dashboard-error",
          title: "Error",
          description: `Failed to load dashboard data: ${errorMessage}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast]) // Dependency on toast to ensure it's available

  if (loading) {
    return (
        <div className="flex-1 flex items-center justify-center p-6 text-xl text-muted-foreground">
          Loading dashboard data...
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex-1 flex items-center justify-center p-6 text-xl text-red-600">
          Error: {error}
        </div>
    );
  }


  return (
      <div className="space-y-6">
        {/* Mobile Title */}
        <div className="sm:hidden">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Employee management system</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Clock In/Out</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/punch">
                <Button className="w-full" size="sm">
                  Go to Punch System
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add Employee</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/employees/add">
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Add New Employee
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime</CardTitle>
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <Link href="/overtime">
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Manage Overtime
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">View Reports</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Generate Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/employees">
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  View All Employees
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{clockedInCount}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clocked Out</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{clockedOutCount}</div>
              <p className="text-xs text-muted-foreground">Not working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Punches</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayPunches}</div> {/* Currently simulated. Requires backend endpoint for real data. */}
              <p className="text-xs text-muted-foreground">Total punch events (simulated)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{overtimeHoursTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Approved this period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${overtimePayTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Estimated additional compensation</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest clock in/out events (Currently simulated. Requires backend endpoint for real data.)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity to display.</p>
              ) : (
                  recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div
                              className={`p-2 rounded-full ${activity.type === "in" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                          >
                            {activity.type === "in" ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{activity.employee}</p>
                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                          </div>
                        </div>
                        <Badge variant={activity.type === "in" ? "default" : "secondary"}>{activity.time}</Badge>
                      </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Time Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Time</CardTitle>
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
  )
}
