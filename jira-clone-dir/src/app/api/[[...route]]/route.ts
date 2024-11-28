/**
 * @file /E:/myPrj/CorePrj/jira-clone/jira-clone-dir/src/app/api/[[...route]]/route.ts
 * 
 * 这个文件使用 Hono 框架设置了应用程序的 API 路由。
 * 它导入了必要的模块并定义了 API 路由的基本路径。
 * 认证路由被添加到应用程序的 "auth" 路径下。
 * GET 处理程序被导出以处理传入的 GET 请求。
 * 
 * @module api/route
 */

import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route"

const app = new Hono().basePath("/api");

const routes = app
    .route("/auth", auth)
    .route("/workspaces", workspaces);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;