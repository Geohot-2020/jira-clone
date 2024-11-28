"use client";

import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateWorkspacesSchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useUpdateWorkspaces } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspaces } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface EditWorkspaceFromProps {
    onCancel?: () => void;
    initialValues: Workspace;
};

export const EditWorkspaceFrom = ({ onCancel, initialValues }: EditWorkspaceFromProps) => {
    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspaces();
    const {
        mutate: deleteWorkspace,
        isPending: isDeletingWorkspace
    } = useDeleteWorkspaces();

    const {
        mutate: resetInviteCode,
        isPending: isResettingInviteCode
    } = useResetInviteCode();

    // 使用 useConfirm 钩子来处理删除工作区的确认对话框
    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "This action cannot be undone",
        "destructive",
    );

    const [ResetDialog, confirmReset] = useConfirm(
        "Reset invite link",
        "This will invalidate the current invite link",
        "destructive",
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof updateWorkspacesSchema>>({
        resolver: zodResolver(updateWorkspacesSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        },
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteWorkspace({
            param: { workspaceId: initialValues.$id },
        }, {
            onSuccess: () => {
                window.location.href = "/";
            },
        });
    };

    const handleResetInviteCode = async () => {
        const ok = await confirmReset();

        if (!ok) return;

        resetInviteCode({
            param: { workspaceId: initialValues.$id },
        }, {
            onSuccess: () => {
                router.refresh();
            },
        });
    };

    const onSubmit = (values: z.infer<typeof updateWorkspacesSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        };

        mutate({
            form: finalValues,
            param: { workspaceId: initialValues.$id },
        }, {
            onSuccess: ({ data }) => {
                form.reset();
                router.push(`/workspaces/${data.$id}`);
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 如果 files 存在，则获取文件列表中的第一个文件
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    };

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => toast.success("Invite link copied to the clipboard"));
    };

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size="sm" variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            alt="Logo"
                                                            width={72}
                                                            height={72}
                                                            className="object-cover"
                                                            src={
                                                                field.value instanceof File
                                                                    ? URL.createObjectURL(field.value)
                                                                    : field.value
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG, SVG or JPEG, max 1MB
                                                    </p>
                                                    <Input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .png, .svg, .jpeg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    />
                                                    {field.value
                                                        ? (
                                                            <Button
                                                                type="button"
                                                                disabled={isPending}
                                                                variant={"destructive"}
                                                                size={"xs"}
                                                                className="w-fit mt-2"
                                                                // 更改已有图片情况下功能
                                                                onClick={() => {
                                                                    field.onChange(null);
                                                                    if (inputRef.current)
                                                                        inputRef.current.value = "";
                                                                }}
                                                            >
                                                                Remove Image
                                                            </Button>
                                                        )
                                                        : (
                                                            <Button
                                                                type="button"
                                                                disabled={isPending}
                                                                variant={"teritary"}
                                                                size={"xs"}
                                                                className="w-fit mt-2"
                                                                onClick={() => inputRef.current?.click()}
                                                            >
                                                                Upload Image
                                                            </Button>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeparator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    size={"lg"}
                                    variant={"secondary"}
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size={"lg"}
                                    disabled={isPending}
                                >
                                    Save Change
                                </Button>
                            </div>
                        </form>
                    </Form>

                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Invite Members</h3>
                        <p className="text-sm text-muted-foreground">
                            Use the invite link to add members to your workspace.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant={"secondary"}
                                    className="size-12"
                                >
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <DottedSeparator className="py-7"/>
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type="button"
                            disabled={isPending || isResettingInviteCode}
                            onClick={handleResetInviteCode}
                        >
                            Reset invite link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a workspace is irreversible and will remove all associated data.
                        </p>
                        <DottedSeparator className="py-7"/>
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size={"sm"}
                            variant={"destructive"}
                            type="button"
                            disabled={isPending || isDeletingWorkspace}
                            onClick={handleDelete}
                        >
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>



        </div>
    );
};