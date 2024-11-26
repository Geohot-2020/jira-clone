import { useQueryState, parseAsBoolean } from "nuqs";
// 自定义钩子，用于管理创建工作区模态框的打开和关闭状态
export const useCreateWorkspaceModal = () => {
    const [isOpen, setIsOpen] = useQueryState(
        "create-workspace",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault: true}),
    );

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen, 
        open,
        close,
        setIsOpen,
    }
};