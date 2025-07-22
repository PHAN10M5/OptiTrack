"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, UserCheck, UserX, Plus, Timer, ClockIcon, DollarSign } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [stats] = useState({
    totalEmployees: 24,
    clockedIn: 18,
    clockedOut: 6,
    todayPunches: 42,
    overtimeHours: 26.5,
    overtimePay: 3815,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const recentActivity = [
    { id: 1, employee: "John Doe", action: "Clock In", time: "09:15 AM", type: "in" },
    { id: 2, employee: "Sarah Smith", action: "Clock Out", time: "09:10 AM", type: "out" },
    { id: 3, employee: "Mike Johnson", action: "Clock In", time: "09:05 AM", type: "in" },
    { id: 4, employee: "Emily Davis", action: "Clock In", time: "09:00 AM", type: "in" },
  ]

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
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.clockedIn}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clocked Out</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.clockedOut}</div>
              <p className="text-xs text-muted-foreground">Not working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Punches</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayPunches}</div>
              <p className="text-xs text-muted-foreground">Total punch events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
              <ClockIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.overtimeHours}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.overtimePay}</div>
              <p className="text-xs text-muted-foreground">Additional compensation</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest clock in/out events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
