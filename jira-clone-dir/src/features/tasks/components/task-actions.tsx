import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";

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
    return (
        <div className="flex justify-end">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg rounded-md">
                    {/* 任务详情 */}
                    <DropdownMenuItem
                        onClick={() => { }}
                        disabled={false}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>
                    {/* 打开任务 */}
                    <DropdownMenuItem
                        onClick={() => { }}
                        disabled={false}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>
                    {/* 编辑任务 */}
                    <DropdownMenuItem
                        onClick={() => { }}
                        disabled={false}
                        className="font-medium p-[10px] hover:bg-gray-100 flex items-center"
                    >
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>
                    {/* 删除任务 */}
                    <DropdownMenuItem
                        onClick={() => { }}
                        disabled={false}
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