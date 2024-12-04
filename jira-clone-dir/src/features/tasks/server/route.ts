import { z } from "zod";
import { ID, Query } from "node-appwrite";

import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schemas";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";



const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
                projectId: z.string().nullish(),    //可以是字符串/null/undefined
                assigneeId: z.string().nullish(),
                status: z.nativeEnum(TaskStatus).nullish(),
                search: z.string().nullish(),
                dueDate: z.string().nullish(),
            })
        ),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");

            const {
                workspaceId,
                projectId,
                status,
                search,
                assigneeId,
                dueDate,             
            } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const query = [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
            ];

            if(projectId) {
                console.log("projectId:", projectId);
                query.push(Query.equal("projectId", projectId));
            }

            if(status) {
                console.log("status:", status);
                query.push(Query.equal("status", status));
            }

            if(assigneeId) {
                console.log("assigneeId:", assigneeId);
                query.push(Query.equal("assigneeId", assigneeId));
            }

            if(dueDate) {
                console.log("dueDate:", dueDate);
                query.push(Query.equal("dueDate", dueDate));
            }

            if(search) {
                console.log("search:", search);
                query.push(Query.search("name", search));
            }

            const tasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                query,
            );


            //从数据库中获取任务文档，并根据任务文档中的项目 ID 和受让人 ID 获取相关的项目和成员文档
            const projectIds = tasks.documents.map((task) => task.projectId);
            const assigneeIds = tasks.documents.map((task) => task.assigneeId);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],            
            );

            //从指定的数据库查询成员文档列表
            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : [],            
            );

            //基于查询到的成员文档中的用户 ID 去获取对应的用户详细信息
            const assignees = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    }
                })
            );

            //填充任务
            const populatedTasks = tasks.documents.map((task) => {
                const project = projects.documents.find(
                    (project) => project.$id === task.projectId,
                );

                const assignee = assignees.find(
                    (assignee) => assignee.$id === task.assigneeId,
                );

                return {
                    ...task,
                    project,
                    assignee,
                };
            });

            return c.json({
                data: {
                    ...tasks,
                    documents: populatedTasks,
                }
            });
        }
    )
    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
            } = c.req.valid("json");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderAsc("position"),
                    Query.limit(1),     //只会去找最高级的任务
                ]
            );

            const newPosition =
                highestPositionTask.documents.length > 0
                    ? highestPositionTask.documents[0].position + 1000
                    : 1000;

            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    position: newPosition,
                },
            );

            return c.json({ data: task });
        }
    );

export default app;