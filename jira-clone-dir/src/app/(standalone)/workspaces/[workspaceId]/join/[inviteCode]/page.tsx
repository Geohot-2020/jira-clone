import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdJoinClient } from "./client";

const WorkspaceIdJoinPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return <WorkspaceIdJoinClient />
}

export default WorkspaceIdJoinPage;

// http://localhost:3000/workspaces/674442200007c590cb26/join/o50Noi