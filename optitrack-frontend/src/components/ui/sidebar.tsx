// src/components/ui/sidebar.tsx
// This is a custom component, not a direct shadcn/ui component,
// but it uses shadcn/ui primitives.

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // Assuming button.tsx exists
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area" // You might need to install @radix-ui/react-scroll-area

// --- Sidebar Root ---
const sidebarVariants = cva(
    "flex flex-col h-full bg-card text-card-foreground border-r",
    {
        variants: {
            variant: {
                default: "w-64", // Default width
                collapsed: "w-16", // Collapsed width
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface SidebarProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof sidebarVariants> {
    isCollapsed?: boolean; // Prop to control collapse state
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
    ({ className, isCollapsed, ...props }, ref) => (
        <aside
            ref={ref}
            className={cn(sidebarVariants({ variant: isCollapsed ? "collapsed" : "default" }), className)}
            {...props}
        />
    )
)
Sidebar.displayName = "Sidebar"

// --- Sidebar Content (for scrollable area) ---
const SidebarContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className="flex-1">
        <ScrollAreaPrimitive.Root className="h-full">
            <ScrollAreaPrimitive.Viewport className={cn("p-4", className)}>
                <div className="h-full">{props.children}</div>
            </ScrollAreaPrimitive.Viewport>
            <ScrollAreaPrimitive.Scrollbar 
                orientation="vertical"
                className="flex w-2.5 border-l border-l-transparent p-[1px] hover:p-[1px]"
            >
                <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
            </ScrollAreaPrimitive.Scrollbar>
            <ScrollAreaPrimitive.Scrollbar 
                orientation="horizontal"
                className="flex h-2.5 border-t border-t-transparent p-[1px] hover:p-[1px]"
            >
                <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border" />
            </ScrollAreaPrimitive.Scrollbar>
            <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
    </div>
))
SidebarContent.displayName = "SidebarContent"

// --- Sidebar Header ---
const SidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        className={cn("flex items-center justify-between p-4 border-b", className)}
        {...props}
        ref={ref}
    />
))
SidebarHeader.displayName = "SidebarHeader"

// --- Sidebar Footer ---
const SidebarFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        className={cn("p-4 border-t", className)}
        {...props}
        ref={ref}
    />
))
SidebarFooter.displayName = "SidebarFooter"

// --- Sidebar Menu ---
const SidebarMenu = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        className={cn("space-y-1", className)}
        {...props}
        ref={ref}
    />
))
SidebarMenu.displayName = "SidebarMenu"

// --- Sidebar Menu Item ---
const SidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li
        className={cn("", className)}
        {...props}
        ref={ref}
    />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// --- Sidebar Menu Button (for navigation links) ---
interface SidebarMenuButtonProps
    extends React.ComponentPropsWithoutRef<typeof Button> {
    icon?: React.ReactNode;
    isCollapsed?: boolean;
    isActive?: boolean;
}

const SidebarMenuButton = React.forwardRef<
    React.ElementRef<typeof Button>,
    SidebarMenuButtonProps
>(({ className, icon, children, isCollapsed, isActive, ...props }, ref) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start text-left",
            isCollapsed ? "px-3" : "px-4", // Adjust padding for collapsed state
            className
        )}
        ref={ref}
        {...props}
    >
        {icon && <span className={cn("mr-2", isCollapsed && "mr-0")}>{icon}</span>}
        {!isCollapsed && children}
    </Button>
))
SidebarMenuButton.displayName = "SidebarMenuButton"

// --- Sidebar Group (for grouping menu items) ---
const SidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        className={cn("space-y-1 mt-4", className)}
        {...props}
        ref={ref}
    />
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        className={cn("text-sm font-semibold text-muted-foreground px-4 py-2", className)}
        {...props}
        ref={ref}
    />
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        className={cn("space-y-1", className)}
        {...props}
        ref={ref}
    />
))
SidebarGroupContent.displayName = "SidebarGroupContent"


export {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
}
