'use client';
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

interface SuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    message?: string;
    onClose?: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
    open,
    onOpenChange,
    title = "Successfully Completed",
    message = "Candidate has been added successfully!",
    onClose,
}) => {
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                    </div>
                    {message && (
                        <DialogDescription className="text-center text-gray-600 pt-2">
                            {message}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="mt-6">
                    <Button
                        onClick={handleClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SuccessDialog;

