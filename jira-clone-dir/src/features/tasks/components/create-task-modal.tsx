"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateTaskFromWrapper } from "./create-task-form-wrapper";

export const CreateTaskModal = () => {
    const {isOpen, setIsOpen, close} = useCreateTaskModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateTaskFromWrapper onCancel={close}/>
        </ResponsiveModal>
    );
};