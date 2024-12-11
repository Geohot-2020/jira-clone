import React, { useCallback, useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult,
} from "@hello-pangea/dnd";

import { Task, TaskStatus } from "../types";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

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
    onChange: (
        tasks: {
            $id: string;
            status: TaskStatus;
            position: number;
        }[]
    ) => void;
};

export const DataKanban = ({
    data,
    onChange,
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

    // 解决无法删除问题
    useEffect(() => {
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };
        data.forEach((task) => {
            newTasks[task.status].push(task);
        });
        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
        });
        setTasks(newTasks);
    }, [data]);

    // 解决拖放固定问题
    const onDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const { source, destination } = result;
            const sourceStatus = source.droppableId as TaskStatus;
            const destStatus = destination.droppableId as TaskStatus;
            // 存储任务更新的负载信息 
            let updatesPayload: { 
                $id: string; 
                status: TaskStatus; 
                position: number; 
            }[] = [];

            setTasks((prevTasks) => {
                const newTasks = { ...prevTasks };

                // 安全移除任务
                const sourceColumn = [...newTasks[sourceStatus]];
                const [movedTask] = sourceColumn.splice(source.index, 1);

                if (!movedTask) {
                    console.log("No task found at the source index");
                    return prevTasks;
                }

                // 状态更新
                const updatedMovedTask = 
                    sourceStatus !== destStatus
                    ? { ...movedTask, status: destStatus }
                    // 返回原来
                    : movedTask;

                // 更新源列
                newTasks[sourceStatus] = sourceColumn;

                // 为新的添加任务
                const destColumn = [...newTasks[destStatus]];
                destColumn.splice(destination.index, 0, updatedMovedTask);
                newTasks[destStatus] = destColumn;

                // 更新任务负载的更新信息
                updatesPayload = [];
                updatesPayload.push({
                    $id: updatedMovedTask.$id,
                    status: destStatus,
                    position: Math.min((destination.index + 1) * 1000, 1_000_000),
                });

                // 任务位置更新
                newTasks[destStatus].forEach((task, index) => {
                    if (task && task.$id !== updatedMovedTask.$id) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (task.position !== newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: destStatus,
                                position: newPosition,
                            });
                        }
                    }
                });

                // 移动到另一列的上方
                if (sourceStatus !== destStatus) {
                    newTasks[sourceStatus].forEach((task, index) => {
                        if (task) {
                            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                            if (task.position !== newPosition) {
                                updatesPayload.push({
                                    $id: task.$id,
                                    status: destStatus,
                                    position: newPosition,
                                });
                            }
                        }
                    });
                }

                return newTasks;
            });

            onChange(updatesPayload);
        }, [onChange]);

    return (
        // 渲染Kanban，并支持拖放
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <KanbanCard task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    );
}