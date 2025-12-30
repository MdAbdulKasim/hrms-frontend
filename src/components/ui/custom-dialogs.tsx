"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* ================= CONFIRM DIALOG ================= */

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: React.ReactNode
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    variant?: "destructive" | "default" | "blue"
    isLoading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false
}: ConfirmDialogProps) {

    const handleCancel = () => {
        if (onCancel) onCancel()
        onOpenChange(false)
    }

    // Determine button styles
    let buttonVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" = "default"
    let buttonClass = ""

    if (variant === "destructive") {
        buttonVariant = "default"
        buttonClass = "bg-blue-600 hover:bg-blue-700 text-white"
    } else if (variant === "blue") {
        buttonVariant = "default"
        buttonClass = "bg-blue-600 hover:bg-blue-700 text-white"
    } else {
        buttonVariant = "default"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="pt-2">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={buttonVariant}
                        className={cn(buttonClass)}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/* ================= ALERT DIALOG (Message/Toast replacement) ================= */

interface AlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: React.ReactNode
    onAction?: () => void
    actionText?: string
    variant?: "success" | "error" | "info" | "warning"
}

export function CustomAlertDialog({
    open,
    onOpenChange,
    title,
    description,
    onAction,
    actionText = "OK",
    variant = "info"
}: AlertDialogProps) {

    const handleAction = () => {
        if (onAction) onAction()
        onOpenChange(false)
    }

    // Determine styles based on variant
    let titleClass = "text-blue-600"
    let buttonClass = "bg-blue-600 hover:bg-blue-700"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className={titleClass}>{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="pt-2">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        className={cn("w-full sm:w-auto text-white", buttonClass)}
                        onClick={handleAction}
                    >
                        {actionText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
