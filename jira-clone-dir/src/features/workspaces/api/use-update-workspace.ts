/**
 * 更新工作区的自定义 Hook。
 *
 * @returns 返回一个包含 mutation 对象的钩子，用于更新工作区。
 *
 * @example
 * const mutation = useUpdateWorkspaces();
 * mutation.mutate({ form: { name: "New Workspace" }, param: { workspaceId: "123" } });
 *
 * @remarks
 * 该 Hook 使用 `react-query` 的 `useMutation` 进行工作区更新操作，并在成功或失败时显示相应的提示信息。
 * 成功更新后，会使与指定 queryKey 相关的所有查询失效，以便重新获取最新数据。
 */

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>;

export const useUpdateWorkspaces = () => {

    const queryClient = useQueryClient();
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form, param }) => {
            const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param });
            if (!response.ok) {
                throw new Error("Failed to update workspace");
            }
            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Workspace updated");
            //使与指定 queryKey 相关的所有查询失效
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
        },
        onError: () => {
            toast.error("Failed to update a workspace");
        },
    });

    return mutation;
}