import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

import { useRouter } from "next/navigation";

import { useDeleteTask } from "../api/use-delete-task";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";


interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
};

export const TaskActions = ({
    id,
    projectId,
    children,
}: TaskActionsProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const { open } = useEditTaskModal();

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete task",
        "This action cannot be done",
        "destructive"
    );

    //使用自定义钩子
    const { mutate, isPending } = useDeleteTask();

    const onDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        mutate({ param: { taskId: id } });
    }

    const onOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`);
    };

    const onOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    };

    return (
        <div className="flex justify-end">
            <ConfirmDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg rounded-md">
                    {/* 任务详情 */}
                    <DropdownMenuItem
                        onClick={onOpenTask}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    {/* 打开项目 */}
                    <DropdownMenuItem
                        onClick={onOpenProject}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    {/* 编辑任务 */}
                    <DropdownMenuItem
                        onClick={() => open(id)}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    {/* 删除任务 */}
                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="text-amber-700 focus:text-amber-700 font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

    );
};