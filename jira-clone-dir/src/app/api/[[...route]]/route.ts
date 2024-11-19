import {Hono} from "hono";
import {handle} from "hono/vercel";

/**
 * 初始化一个新的 Hono 应用实例，基础路径为 "/api"。
 * 
 * @constant {Hono} app - Hono 应用实例。
 */
const app = new Hono().basePath("/api");

app.get("/hello", (c) => {
    return c.json({hello : "world"});
});

export const GET = handle(app);