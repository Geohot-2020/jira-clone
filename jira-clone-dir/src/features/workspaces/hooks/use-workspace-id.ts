import { useParams } from "next/navigation";

// 调用当前url作为参数
export const useWorkspaceId = () => {
    const params = useParams();
    return params.workspaceId as string;
};