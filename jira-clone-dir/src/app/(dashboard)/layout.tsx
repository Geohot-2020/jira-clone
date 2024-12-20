import { Suspense } from "react";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";

/**
 * DashboardLayout 组件。
 *
 * 该组件作为应用程序仪表板部分的布局包装器。
 *
 * @param {DashboardLayoutProps} props - DashboardLayout 组件的属性。
 * @param {React.ReactNode} props.children - 要在布局中渲染的子元素。
 *
 * @returns {JSX.Element} 渲染的布局组件。
 */
interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div className="min-h-screen">
            <Suspense fallback={<div>Loading...</div>}>
                <CreateWorkspaceModal />
                <CreateProjectModal />
                <CreateTaskModal />
                <EditTaskModal />
                <div className="flex w-full h-full">
                    <div className="fixed left-0 top-0 hidden lg:block lg:w-[264px] h-full overflow-y-auto">
                        <Sidebar />
                    </div>
                    <div className="lg:pl-[264px] w-full">
                        <div className="mx-auto max-w-screen-2xl h-full">
                            <Navbar />
                            <main className="h-full py-8 px-6 flex flex-col">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </Suspense>
        </div>
    );
}

export default DashboardLayout;