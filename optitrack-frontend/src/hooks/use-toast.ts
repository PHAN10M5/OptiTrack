// src/hooks/use-toast.ts
import * as React from "react"

import { ToastActionElement, ToastProps } from "@/components/ui/toaster"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000 // 5 seconds is a reasonable time for toast notifications

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    variant?: "default" | "destructive" | "success"
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

// Generate a unique ID using timestamp and random number
function genId() {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

type Action =
    | {
    type: typeof actionTypes.ADD_TOAST
    toast: ToasterToast
}
    | {
    type: typeof actionTypes.UPDATE_TOAST
    toast: Partial<ToasterToast>
}
    | {
    type: typeof actionTypes.DISMISS_TOAST
    toastId?: ToasterToast["id"]
}
    | {
    type: typeof actionTypes.REMOVE_TOAST
    toastId?: ToasterToast["id"]
}

interface State {
    toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case actionTypes.ADD_TOAST:
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            }

        case actionTypes.UPDATE_TOAST:
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }

        case actionTypes.DISMISS_TOAST:
            const { toastId } = action
            // First set open to false, which triggers the closing animation
            if (toastId) {
                return {
                    ...state,
                    toasts: state.toasts.map((t) =>
                        t.id === toastId ? { ...t, open: false } : t
                    ),
                }
            }
            return {
                ...state,
                toasts: state.toasts.map((t) => ({ ...t, open: false })),
            }

        case actionTypes.REMOVE_TOAST:
            if (action.toastId) {
                return {
                    ...state,
                    toasts: state.toasts.filter((t) => t.id !== action.toastId),
                }
            }
            return {
                ...state,
                toasts: [],
            }
        default:
            return state
    }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => listener(memoryState))

    // Remove toast after animation completes
    if (action.type === actionTypes.DISMISS_TOAST && action.toastId) {
        setTimeout(() => {
            dispatch({
                type: actionTypes.REMOVE_TOAST,
                toastId: action.toastId,
            })
        }, 300) // Animation duration
    }
}

type Toast = Pick<ToasterToast, "id" | "duration" | "title" | "description" | "action" | "variant">

function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: ToasterToast) =>
        dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    // Set default duration if not provided
    const duration = props.duration ?? TOAST_REMOVE_DELAY

    dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
            ...props,
            id,
            open: true, // Explicitly set open to true
            onOpenChange: (open) => { // Add onOpenChange handler
                if (!open) dismiss()
            },
        },
    })

    // Set up automatic dismissal after duration
    if (duration !== Infinity) {
        setTimeout(() => {
            dismiss()
        }, duration)
    }

    return {
        id: id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [])

    return {
        ...state,
        toast,
        dismiss: React.useCallback(
            (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
            []
        ),
    }
}

export { toast, useToast }
