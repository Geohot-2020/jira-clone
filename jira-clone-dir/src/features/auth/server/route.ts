
/**
 * @file /E:/myPrj/CorePrj/jira-clone/jira-clone-dir/src/features/auth/server/route.ts
 * 
 * 这个文件使用 Hono 框架定义了应用程序的身份验证路由。
 * 它包括用户登录、注册、获取当前用户和注销的路由。
 * 
 * 这些路由使用 Zod 进行模式验证，并使用 Appwrite 进行用户管理。
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie"
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";

/**
 * 初始化 Hono 应用并定义身份验证路由。
 * 
 * @route GET /current - 获取当前已认证的用户。
 * @route POST /login - 验证用户并设置会话 cookie。
 * @route POST /register - 注册新用户并设置会话 cookie。
 * @route POST /logout - 注销当前用户并删除会话 cookie。
 * 
 * @returns {Hono} 定义了路由的 Hono 应用实例。
 */

const app = new Hono()
    .get(
        "/current", 
        sessionMiddleware, 
        (c) => {
            const user = c.get("user");

            return c.json({ "data": user });
        }
    )
    .post(
        "/login",
        zValidator("json", loginSchema),
        async (c) => {
            const { email, password } = c.req.valid("json");

            const { account } = await createAdminClient();
            const session = await account.createEmailPasswordSession(
                email,
                password,
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30,
            })

            return c.json({ success: true });
        }
    )
    .post(
        "/register",
        zValidator("json", registerSchema),
        async (c) => {
            const { name, email, password } = c.req.valid("json");

            const { account } = await createAdminClient();
            await account.create(
                ID.unique(),
                email,
                password,
                name,
            );

            const session = await account.createEmailPasswordSession(
                email,
                password,
            );

            setCookie(c, AUTH_COOKIE, session.secret, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30,
            })

            return c.json({ success: true });
        }
    )
    .post(
        "/logout", 
        sessionMiddleware, 
        async (c) => {
            const account = c.get("account");

            deleteCookie(c, AUTH_COOKIE);
            await account.deleteSession("current");

            return c.json({ success: true });
        }
    );

export default app;