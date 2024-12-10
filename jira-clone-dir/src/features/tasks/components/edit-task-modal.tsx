/**
 * @file edit-task-modal.tsx
 * @description 该文件定义了一个编辑任务的模态框组件。
 * 
 * @module EditTaskModal
 * 
 * @description
 * EditTaskModal 组件用于显示和处理编辑任务的模态框。
 * 它依赖于 useEditTaskModal 钩子来获取当前任务的 ID 和关闭模态框的函数。
 * 当 taskId 存在时，模态框会打开，并显示 CreateTaskFromWrapper 组件。
 * 
 * @component
 * @example
 * <EditTaskModal />
 * 
 * @returns {JSX.Element} 返回一个包含编辑任务表单的模态框组件。
 */
"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { EditTaskFromWrapper } from "./edit-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";


export const EditTaskModal = () => {
    const { taskId, close } = useEditTaskModal();

    return (
        <ResponsiveModal open={!!taskId} onOpenChange={close}>
            {taskId && (
                <EditTaskFromWrapper onCancel={close} id={taskId}/>
            )}
        </ResponsiveModal>
    );
};