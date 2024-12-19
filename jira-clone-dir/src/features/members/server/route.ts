import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { Member, MemberRole } from "../types";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId } = c.req.valid("query");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const members = await databases.listDocuments<Member>(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", workspaceId)]
            );

            /*
             * 遍历 members.documents 数组中的每个成员文档，
             * 异步获取与每个成员关联的用户信息，
             * 并将用户的 name 和 email 属性合并到成员文档中
             */
            const populatedMembers = await Promise.all(
                members.documents.map(async (member) => {
                    
                    const user = await users.get(member.userId);

                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    }
                })
            );

            return c.json({
                data: {
                    // ...对象展开运算符
                    ...members,
                    documents: populatedMembers,
                }
            });
        }
    )
    .delete(
        "/:memberId",
        sessionMiddleware,
        async (c) => {
            // 请求参数获取
            const { memberId } = c.req.param();
            // 上下文获取
            const user = c.get("user");
            const databases = c.get("databases");


            const memberToDelete = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToDelete.workspaceId)]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToDelete.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // 若仅有一个成员，无法删除
            if (allMembersInWorkspace.total === 1) {
                return c.json({ error: "Can't delete the only member" }, 400);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            return c.json({ data: { $id: memberToDelete.$id } });
        }
    )
    .patch(
        // :代表路径参数
        "/:memberId",
        sessionMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {
            // 请求参数获取
            const { memberId } = c.req.param();
            // 验证提取
            const { role } = c.req.valid("json");
            // 上下文获取
            const user = c.get("user");
            const databases = c.get("databases");


            const memberToUpdate = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
            );

            const allMembersInWorkspace = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("workspaceId", memberToUpdate.workspaceId)]
            );

            const member = await getMember({
                databases,
                workspaceId: memberToUpdate.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            if (member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            // 若仅有一个成员，无法删除
            if (allMembersInWorkspace.total === 1) {
                return c.json({ error: "Can't downgrade the only member" }, 400);
            }

            await databases.updateDocument(
                DATABASE_ID,
                MEMBERS_ID,
                memberId,
                {
                    role,
                }
            );

            return c.json({ data: { $id: memberToUpdate.$id } });
        }
    );

export default app;