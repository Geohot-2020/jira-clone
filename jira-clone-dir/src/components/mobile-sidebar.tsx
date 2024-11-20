"use client";

import { MenuIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * 移动端侧边栏组件。
 * 
 * @component
 * @returns {JSX.Element} 返回一个包含侧边栏的 JSX 元素。
 * 
 * @example
 * <MobileSidebar />
 * 
 * @description
 * 该组件使用了 `Sheet` 组件来实现一个侧边栏，并且使用了 `SheetTrigger` 和 `SheetContent` 来控制侧边栏的显示和内容。
 * 在小屏幕设备上，点击按钮会显示侧边栏。
 * 
 * @remarks
 * - `lg:hidden` 是 Tailwind CSS 提供的一个响应式类名，它的作用是在大屏幕（lg 断点及以上）时隐藏元素，而在小屏幕时显示元素。
 * - `Button` 组件用于触发侧边栏的显示，`MenuIcon` 是按钮上的图标。
 * - `Sidebar` 组件是侧边栏的内容。
 */
export const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant={"secondary"} className="lg:hidden size-8">
                    <MenuIcon className="size-4 text-neutral-500" />
                </Button>
            </SheetTrigger>
            <SheetContent side={"left"} className="p-0">
                <Sidebar />
            </SheetContent>
        </Sheet>
    );
};