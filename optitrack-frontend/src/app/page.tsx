"use client"

import { useEffect, useState } from "react" // useEffect and useState are no longer strictly needed for this file's core logic
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Timer, Users, Clock, BarChart3, ArrowRight, Shield, User } from "lucide-react"
import Link from "next/link"
// useRouter is no longer needed if we remove the auto-redirect useEffect
// import { useRouter } from "next/navigation"

// The getUserRoleFromLocalStorage helper is not directly needed in HomePage anymore
// as HomePage will no longer perform role-based redirects.
// const getUserRoleFromLocalStorage = (): string | null => {
//   if (typeof window !== "undefined") {
//     return localStorage.getItem("userRole");
//   }
//   return null;
// };

export default function HomePage() {
  // Removed isLoading state as there's no initial authentication check causing a loading state here.
  // Removed useRouter as automatic redirection is removed.

  // The useEffect for automatic redirection based on userRole is removed.
  // This ensures the homepage always appears first.

  // The landing page content is always rendered.
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Timer className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-display gradient-text">OptiTrack</h1>
                  <p className="text-sm text-muted-foreground font-caption">Employee Management System</p>
                </div>
              </div>
              <Link href="/login">
                <Button className="shadow-modern">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Timer className="h-4 w-4" />
                Modern Employee Time Tracking
              </div>
              <h1 className="text-5xl md:text-6xl font-display text-balance mb-6 leading-tight">
                Streamline Your
                <span className="gradient-text block">Employee Tracking</span>
              </h1>
              <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto mb-8 leading-relaxed">
                A comprehensive employee clock-in system with real-time tracking, overtime management, and detailed
                reporting. Perfect for businesses of all sizes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6 shadow-modern-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/50 backdrop-blur-sm"
                  onClick={() => {
                    document.getElementById("features-section")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }}
              >
                Learn More
              </Button>
            </div>

            {/* Feature Cards */}
            <div id="features-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="card-hover border-0 shadow-modern bg-white/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-green-100 rounded-xl w-fit">
                    <Clock className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="font-heading">Easy Clock In/Out</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body">
                    Simple and intuitive time tracking with instant confirmation and real-time updates.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-modern bg-white/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-xl w-fit">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="font-heading">Employee Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body">
                    Comprehensive employee profiles with department organization and status tracking.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-modern bg-white/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-xl w-fit">
                    <Timer className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="font-heading">Overtime Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body">
                    Automatic overtime calculation with customizable rates and approval workflows.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-hover border-0 shadow-modern bg-white/60 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-xl w-fit">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="font-heading">Detailed Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-body">
                    Generate comprehensive reports with hours worked, attendance, and payroll data.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Access Portals */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display mb-4">Choose Your Portal</h2>
              <p className="text-lg text-muted-foreground font-body">
                Access the system based on your role and permissions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Admin Portal */}
              <Card className="card-hover border-0 shadow-modern-lg bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-2xl w-fit">
                    <Shield className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-heading">Admin Portal</CardTitle>
                  <CardDescription className="text-base font-body">
                    Full system access with employee management, reporting, and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Manage all employees
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      View all punch records
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Generate reports
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      Manage overtime
                    </li>
                  </ul>
                  <Link href="/login" className="block">
                    <Button className="w-full mt-6" size="lg">
                      Admin Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Employee Portal */}
              <Card className="card-hover border-0 shadow-modern-lg bg-gradient-to-br from-green-50 to-emerald-100">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-2xl w-fit">
                    <User className="h-12 w-12 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl font-heading">Employee Portal</CardTitle>
                  <CardDescription className="text-base font-body">
                    Personal time tracking with clock in/out and punch history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      Clock in and out
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      View your punch history
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      Track your hours
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      View your profile
                    </li>
                  </ul>
                  <Link href="/login" className="block">
                    <Button className="w-full mt-6 bg-green-600 hover:bg-green-700" size="lg">
                      Employee Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Accounts */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-modern bg-gray-50/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="font-heading">Try Demo Accounts</CardTitle>
                <CardDescription className="font-body">
                  Test the system with these pre-configured accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">Admin Account</h4>
                    <p className="text-sm font-mono bg-white p-2 rounded border">john.doe@optitrack.com</p>
                    <p className="text-sm font-mono bg-white p-2 rounded border">password123</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-600">Employee Account</h4>
                    <p className="text-sm font-mono bg-white p-2 rounded border">sarah.smith@optitrack.com</p>
                    <p className="text-sm font-mono bg-white p-2 rounded border">password123</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-heading">OptiTrack</span>
            </div>
            <p className="text-sm text-muted-foreground font-caption">
              © 2024 OptiTrack System. Modern employee time management solution.
            </p>
          </div>
        </footer>
      </div>
  );
}