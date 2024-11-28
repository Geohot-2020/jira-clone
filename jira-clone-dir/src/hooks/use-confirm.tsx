/**
 * useConfirm 是一个自定义 Hook，用于显示确认对话框并返回用户的确认结果。
 *
 * @param {string} title - 对话框的标题。
 * @param {string} message - 对话框的消息内容。
 * @param {ButtonProps["variant"]} [variant="primary"] - 确认按钮的样式变体。
 * @returns {[() => JSX.Element, () => Promise<unknown>]} - 返回一个包含两个元素的数组：
 *   1. ConfirmationDialog 组件，用于渲染确认对话框。
 *   2. confirm 函数，返回一个 Promise，当用户确认或取消时解析。
 */

import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonProps["variant"] = "primary"
): [() => JSX.Element, () => Promise<unknown>] => {
    // useState 钩子定义了一个名为 promise 的状态变量及其更新函数 setPromise
    const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);

    // 创建Promise
    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve });
        });
    };

    // 处理关闭，取消和确认
    const handleClose = () => {
        setPromise(null);
    };
    const handleCancel = () => {
        promise?.resolve(true);
        handleClose();
    };
    const handleConfirm = () => {
        promise?.resolve(true);
        handleClose();
    };

    const ConfirmationDialog = () => (
        <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="pt-8">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <div className="pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button onClick={handleCancel} variant={"outline"} className="w-full lg:w-auto">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} variant={variant} className="w-full lg:w-auto">
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    );

    return [ConfirmationDialog, confirm];
};