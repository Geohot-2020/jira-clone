/**
 * 会话中间件，用于处理用户会话和Appwrite客户端初始化。
 * 
 * @param {AdditionalContext} c - 上下文对象，包含变量和用户信息。
 * @param {Function} next - 下一个中间件函数。
 * 
 * @returns {Promise<void>} - 异步函数，不返回任何值。
 * 
 * 该中间件执行以下操作：
 * 1. 初始化Appwrite客户端并设置端点和项目ID。
 * 2. 从cookie中获取会话信息，如果没有会话信息则返回401未授权错误。
 * 3. 设置Appwrite客户端会话。
 * 4. 初始化Account、Databases和Storage对象。
 * 5. 获取当前用户信息并将其存储在上下文中。
 * 6. 调用下一个中间件函数。
 */

import "server-only";

import {
    Account,
    Client,
    Databases,
    Models,
    Storage,
    type Account as AccountType,
    type Databases as DatabasesType,
    type Storage as StorageType,
    type Users as UsersType,
} from "node-appwrite";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { AUTH_COOKIE } from "@/features/auth/constants";
import next from "next";

type AdditionalContext = {
    Variables: {
        account: AccountType,
        databases: DatabasesType,
        storage: StorageType,
        users: UsersType,
        user: Models.User<Models.Preferences>,
    };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
    async (c, next) => {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
        
        const session = getCookie(c, AUTH_COOKIE);

        if (!session)
            return c.json({error: "Unauthorized"}, 401);
        
        client.setSession(session);

        const account = new Account(client);
        const databases = new Databases(client);
        const storage = new Storage(client);
        
        const user = await account.get();

        c.set("account", account);
        c.set("databases", databases);
        c.set("storage", storage);
        c.set("user", user);

        await next();
    },
);