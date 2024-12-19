import { useQueryState } from "nuqs";

/**
 * 自定义 Hook，用于管理编辑任务模态框的状态。
 *
 * @returns {object} 返回包含以下属性和方法的对象：
 * - taskId: 当前编辑的任务 ID。
 * - open: 打开编辑任务模态框并设置任务 ID 的方法。
 * - close: 关闭编辑任务模态框的方法。
 * - setTaskId: 设置任务 ID 的方法。
 */
export const useEditTaskModal = () => {
    const [taskId, setTaskId] = useQueryState(
        "edit-task",
    );

    const open = (id: string) => setTaskId(id);
    const close = () => setTaskId(null);

    return {
        taskId,
        open,
        close,
        setTaskId,
    }
};