import { getCurrent } from "@/features/auth/queries";
import { JoinWorkspaceFrom } from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface WorkspaceIdJoinPageProps {
    params: {
        workspaceId: string,
    };
};

const WorkspaceIdJoinPage = async ({
    params,
}: WorkspaceIdJoinPageProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const initialValues = await getWorkspaceInfo({
        workspaceId: params.workspaceId,
    });

    if (!initialValues) {
        redirect("/");
    }

    return (
        <div className="w-full lg:max-w-lg">
            <JoinWorkspaceFrom 
            initialValues={initialValues} />
        </div>
    );
}

export default WorkspaceIdJoinPage;

// http://localhost:3000/workspaces/674442200007c590cb26/join/o50Noi