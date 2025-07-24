"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 1. Root Sidebar Component
const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full flex-col bg-background text-foreground",
            className
        )}
        {...props}
    />
))
Sidebar.displayName = "Sidebar"

// 2. Sidebar Header
const SidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center justify-between p-4", className)}
        {...props}
    />
))
SidebarHeader.displayName = "SidebarHeader"

// 3. Sidebar Content Area (main scrollable part)
const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
        {...props}
    />
))
SidebarContent.displayName = "SidebarContent"

// 4. Sidebar Group (for logical grouping of menu items)
const SidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col gap-1 p-2", className)}
        {...props}
    />
))
SidebarGroup.displayName = "SidebarGroup"

// 5. Sidebar Group Label (e.g., "Navigation")
const SidebarGroupLabel = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
        {...props}
    />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// 6. Sidebar Group Content (container for items within a group)
const SidebarGroupContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...props}
    />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

// 7. Sidebar Menu (a wrapper for menu items)
const SidebarMenu = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-y-1", className)}
        {...props}
    />
))
SidebarMenu.displayName = "SidebarMenu"

// 8. Sidebar Menu Item (individual list item for a menu button)
const SidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        className={cn("", className)}
        {...props}
    />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// 9. Sidebar Menu Button (the actual clickable button inside a menu item)
const sidebarMenuButtonVariants = cva(
    "inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-3 py-2 w-full gap-3",
    {
        variants: {
            isActive: {
                true: "bg-accent text-accent-foreground",
                false: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            },
        },
        defaultVariants: {
            isActive: false,
        },
    }
)

interface SidebarMenuButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof sidebarMenuButtonVariants> {
    asChild?: boolean;
}

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    SidebarMenuButtonProps
>(({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        <Comp
            className={cn(sidebarMenuButtonVariants({ isActive, className }))}
            ref={ref}
            {...props}
        />
    )
})
SidebarMenuButton.displayName = "SidebarMenuButton"


// 10. Sidebar Footer
const SidebarFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("border-t p-4", className)}
        {...props}
    />
))
SidebarFooter.displayName = "SidebarFooter"


export {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
}
