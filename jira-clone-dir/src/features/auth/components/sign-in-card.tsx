"use client";

import { z } from "zod"
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { loginSchema } from "../schemas";
import { useLogin } from "../api/use-login";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";


export const SignInCard = () => {
    // mutate 是从 useLogin 钩子中解构出来的一个函数
    const { mutate, isPending } = useLogin();

    // 自动类型推断，根据Zod模式推断出相应的ts类型
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    // 当用户提交表单时，onSubmit 函数会被调用
    const onSubmit = (values: z.infer<typeof loginSchema>) => {
        mutate({ json: values });
    }

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl">
                    Welcome Back
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                {/* 接收form组件 */}
                <Form {...form}>
                    {/* 绑定事件处理表单提交 */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* 渲染表单字段 */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter email address"
                                            // 传递属性值
                                            {...field}
                                        />
                                    </FormControl>
                                    {/* 自动显示 */}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button disabled={isPending} size={"lg"} className="w-full">
                            Login
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    onClick={() => signUpWithGoogle()}
                    disabled={isPending}
                    variant={"secondary"}
                    size={"lg"}
                    className="w-full"
                >
                    <FcGoogle className="mr-2 size-5" />
                    Login with Google
                </Button>
                <Button
                    onClick={() => signUpWithGithub()}
                    disabled={isPending}
                    variant={"secondary"}
                    size={"lg"}
                    className="w-full"
                >
                    <FaGithub className="mr-2 size-5" />
                    Login with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="px-7 flex items-center justify-center">
                <p>
                    Don&apos;t have an Account?
                    <Link href={"/sign-up"}>
                        <span className="text-blue-700">&nbsp;Sign Up</span>
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
};