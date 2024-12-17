/**
 * 使用 `useCreateWorkspaces` 自定义 Hook 创建工作区。
 *
 * 该 Hook 使用 `useMutation` 和 `useQueryClient` 来处理工作区的创建操作。
 * 
 * @typedef {ResponseType} 响应类型，推断自 `client.api.workspaces["$post"]` 的响应类型。
 * @typedef {RequestType} 请求类型，推断自 `client.api.workspaces["$post"]` 的请求类型。
 *
 * @returns {Mutation<ResponseType, Error, RequestType>} 返回一个包含 mutation 对象的自定义 Hook。
 *
 * @example
 * ```typescript
 * const { mutate, isLoading, error } = useCreateWorkspaces();
 * 
 * const createWorkspace = () => {
 *   mutate({ json: { name: "New Workspace" } });
 * };
 * ```
 *
 * @remarks
 * - `mutationFn` 是一个异步函数，用于发送创建工作区的请求，并返回响应的 JSON 数据。
 * - `onSuccess` 回调函数在请求成功时触发，用于使与指定 `queryKey` 相关的所有查询失效。
 */

import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>;

export const useUpdateTask = () => {

    const queryClient = useQueryClient();
    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });
            if (!response.ok) {
                throw new Error("Failed to update task");
            }
            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Task updated");
            //使与指定 queryKey 相关的所有查询失效
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["tasks", data.$id] });
        },
        onError: () => {
            toast.error("Failed to update a task");
        },
    });

    return mutation;
}