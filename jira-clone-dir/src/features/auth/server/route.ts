import { z } from "zod"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie"
import { AUTH_COOKIE } from "../constants";

/**
 * 初始化一个新的 Hono 应用程序并设置一个用于用户登录的 POST 路由。
 * 
 * @route POST /login
 * @middleware zValidator - 验证请求体以确保其包含有效的电子邮件和密码。
 * @param {string} email - 用户的电子邮件地址。
 * @param {string} password - 用户的密码。
 * @returns {Object} JSON 响应，指示登录操作的成功。
 */
const app = new Hono()
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
    .post("/logout", (c) => {
        deleteCookie(c, AUTH_COOKIE);

        return c.json({ success: true });
    });

export default app;