import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspacesSchema, updateWorkspacesSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";

/**
 * @fileoverview 该文件定义了用于处理工作区相关请求的路由。
 * 
 * @description
 * 该文件包含三个主要的路由处理程序：
 * 1. GET "/" - 获取当前用户所属的所有工作区。
 * 2. POST "/" - 创建一个新的工作区，并将当前用户设为管理员。
 * 3. PATCH "/:workspaceId" - 更新指定工作区的信息，只有管理员可以执行此操作。
 * 
 * @route GET /
 * @description 获取当前用户所属的所有工作区。
 * @middleware sessionMiddleware - 验证用户会话。
 * @returns {Promise<Response>} 包含工作区列表的响应。
 * 
 * @route POST /
 * @description 创建一个新的工作区，并将当前用户设为管理员。
 * @middleware zValidator - 验证请求数据。
 * @middleware sessionMiddleware - 验证用户会话。
 * @returns {Promise<Response>} 包含新创建的工作区的响应。
 * 
 * @route PATCH /:workspaceId
 * @description 更新指定工作区的信息，只有管理员可以执行此操作。
 * @middleware sessionMiddleware - 验证用户会话。
 * @middleware zValidator - 验证请求数据。
 * @returns {Promise<Response>} 包含更新后工作区的响应。
 */
const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } });
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds),
            ]
        );

        return c.json({ data: workspaces });
    })
    .post(
        "/",    // / => /workspaces 
        zValidator("form", createWorkspacesSchema),
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { name, image } = c.req.valid("form");

            let uploadImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            }

            const workspace = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadImageUrl,
                    inviteCode: generateInviteCode(6),
                },
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                },
            );

            return c.json({ data: workspace });
        }
    )
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form", updateWorkspacesSchema),
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("form");

            // await等待异步，若没有则返回Promise对象，无属性
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            let uploadImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            } else {
                uploadImageUrl = image;
            }

            // 更新工作区信息
            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadImageUrl,
                }
            );

            return c.json({ data: workspace });
        }
    );

export default app;