import { z } from "zod"
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "../schemas";

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

            console.log({ email, password });

            return c.json({ email, password });
        }
    )
    .post(
        "/register",
        zValidator("json", registerSchema),
        async (c) => {
            const { name, email, password } = c.req.valid("json");

            console.log({ name, email, password });

            return c.json({ name, email, password });
        }
    );

export default app;