/**
 * 获取成员信息
 * 
 * @param {Object} props - 参数对象
 * @param {Databases} props.databases - 数据库实例
 * @param {string} props.workspaceId - 工作区ID
 * @param {string} props.userId - 用户ID
 * 
 * @returns {Promise<Object>} 成员信息文档
 */
import { Query, type Databases } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/config";

interface GetMemberProps {
    databases: Databases,
    workspaceId: string,
    userId: string,
}

export const getMember = async ({
    databases,
    workspaceId,
    userId,
}: GetMemberProps) => {
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
            Query.equal("workspaceId", workspaceId),
            Query.equal("userId", userId),
        ],
    )

    return members.documents[0];
}