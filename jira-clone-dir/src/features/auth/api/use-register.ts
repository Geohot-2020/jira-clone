/**
 * 使用 react-query 的 useMutation 处理用户登录的自定义 Hook。
 *
 * 这个 Hook 使用 `@tanstack/react-query` 的 `useMutation` 钩子来执行登录操作。
 * 它向 `client.api.auth.login` 端点发送带有提供的 JSON 负载的 POST 请求，并返回响应。
 *
 * @returns {UseMutationResult<ResponseType, Error, RequestType>} 包含状态和处理登录操作的方法的 mutation 对象。
 *
 * @typedef {InferResponseType<typeof client.api.auth.login["$post"]>} ResponseType - 登录端点响应的类型。
 * @typedef {InferRequestType<typeof client.api.auth.login["$post"]>["json"]} RequestType - 登录端点请求负载的类型。
 */


import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.register["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.register["$post"]>;

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json }) => {
            const response = await client.api.auth.register["$post"]({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Registered");
            router.refresh();
            queryClient.invalidateQueries({queryKey: ["current"]});
        },
        onError: () => {
            toast.error("Register failed");
        },
    });

    return mutation;
}