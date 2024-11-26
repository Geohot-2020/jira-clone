import { getCurrent } from "@/features/auth/actions";
import { CreateWorkspaceFrom } from "@/features/workspaces/components/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async() => {
    const user = await getCurrent();
    if (!user)  redirect("/sign-in");
    return (  
        <div className="w-full lg:max-w-xl">
            <CreateWorkspaceFrom />
        </div>
    );
}
 
export default WorkspaceCreatePage;