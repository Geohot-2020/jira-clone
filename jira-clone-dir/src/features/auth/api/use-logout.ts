/**
 * 使用 react-query 的 useMutation 处理用户注销的自定义 Hook。
 *
 * 这个 Hook 使用 `@tanstack/react-query` 的 `useMutation` 钩子来执行注销操作。
 * 它向 `client.api.auth.logout` 端点发送 POST 请求，并返回响应。
 *
 * @returns {UseMutationResult<ResponseType, Error, RequestType>} 包含状态和处理注销操作的方法的 mutation 对象。
 *
 * @typedef {InferResponseType<typeof client.api.auth.logout["$post"]>} ResponseType - 注销端点响应的类型。
 * @typedef {InferRequestType<typeof client.api.auth.logout["$post"]>} RequestType - 注销端点请求负载的类型。
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            const response = await client.api.auth.logout["$post"]();
            return await response.json();
        },
        onSuccess: () => {
           router.refresh();
           queryClient.invalidateQueries({queryKey: ["current"]});
        }
    });

    return mutation;
}