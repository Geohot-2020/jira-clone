"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateProjectFrom } from "./create-project-form";
import { useCreateProjectModal } from "../hooks/use-create-project-modal";

export const CreateProjectModal = () => {
    const {isOpen, setIsOpen, close} = useCreateProjectModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateProjectFrom onCancel={close}/>
        </ResponsiveModal>
    );
}