import React, { useCallback, useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";

import { Task, TaskStatus } from "../types";
import { KanbanColumnHeader } from "./kanban-column-header";

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

// 任务状态
type TaskState = {
    [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
    data: Task[];
};

export const DataKanban = ({
    data,
}: DataKanbanProps) => {
    //初始化一个包含任务状态的对象，并将其作为 React 组件的状态
    const [tasks, setTasks] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };
        // 任务根据其状态分类存储
        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });
        // 每个状态数组中按照 position 属性进行排序
        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
        });
        return initialTasks;
    });

    return (
        // 渲染Kanban，并支持拖放
        <DragDropContext onDragEnd={() => { }}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader 
                                board={board}
                                taskCount={tasks[board].length}
                            />
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    );
}