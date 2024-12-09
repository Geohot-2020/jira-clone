import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
};

export type Task = Models.Document & {
    name: string,
    statusL: TaskStatus,
    assigneeId: string,
    projectId: string,
    position: number,
    dueDate: string,
};
