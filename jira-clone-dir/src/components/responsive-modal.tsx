import {useMedia} from "react-use";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

import {
    Drawer,
    DrawerContent,
} from "@/components/ui/drawer";

interface ResponsiveModalProps {
    children: React.ReactNode;  //模态框的子元素
    open: boolean;  //模态框的打开状态
    onOpenChange: (open: boolean) => void;  //处理模态框状态变化的函数
}

export const ResponsiveModal = ({
    children,
    open,
    onOpenChange,
}: ResponsiveModalProps) => {
    const isDesktop = useMedia("(min-width:1024px)", true);

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-lg p-0 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
                    {children}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
            <div className="overflow-y-auto hide-scrollbar max-h-[85vh]">
                {children}
            </div>
            </DrawerContent>
        </Drawer>
    );
};