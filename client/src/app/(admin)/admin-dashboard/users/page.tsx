"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/services/userService";
import { PageLoader } from "@/components/common/Loader";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Trash2, Calendar, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { UserDetailDialog } from "@/components/admin/UserDetailDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersManagementPage() {
    const queryClient = useQueryClient();
    
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const { data: usersData, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getAllUsers,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await userService.deleteUser(id);
        },
        onSuccess: () => {
            toast.success("User deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsDeleteOpen(false);
        },
        onError: () => {
            toast.error("Failed to delete user");
            setIsDeleteOpen(false);
        }
    });

    const handleViewDetails = (user: any) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleDelete = (id: string) => {
        setUserToDelete(id);
        setIsDeleteOpen(true);
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) return <PageLoader text="Loading user directory..." />;

    if (isError) return <div className="text-center py-20 text-red-500">Failed to load users.</div>;

    const allUsers = usersData?.data || [];
    
    const filteredUsers = allUsers.filter((user: any) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">User Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage system users, view appointments, and update roles.
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                     <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        <Input 
                            placeholder="Search name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:text-white dark:border-zinc-800"
                        />
                     </div>
                     <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[180px] bg-white dark:text-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-zinc-500" />
                                <SelectValue placeholder="All Roles" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="patient">Patients Only</SelectItem>
                            <SelectItem value="doctor">Doctors Only</SelectItem>
                            <SelectItem value="admin">Admins Only</SelectItem>
                        </SelectContent>
                     </Select>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 overflow-hidden shadow-sm w-full">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableHead className="w-[30%]">User Identity</TableHead>
                            <TableHead className="w-[20%]">Role & Access</TableHead>
                            <TableHead className="w-[20%]">Joined Date</TableHead>
                            <TableHead className="w-[20%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    No users found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user: any) => (
                                <TableRow key={user._id} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-zinc-100 dark:border-zinc-800">
                                                <AvatarImage src={user.profileImage} />
                                                <AvatarFallback className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{user.name}</span>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            capitalize font-normal px-2.5 py-0.5
                                            ${user.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-300' : 
                                            user.role === 'doctor' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300' :
                                            'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'}
                                        `}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-950 dark:border-zinc-800 p-1">
                                                <DropdownMenuItem onClick={() => handleViewDetails(user)} className="cursor-pointer dark:focus:bg-zinc-900 dark:text-zinc-200 mb-1">
                                                    <Calendar className="mr-2 h-4 w-4 text-emerald-500" /> View History
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(user)} className="cursor-pointer dark:focus:bg-zinc-900 dark:text-zinc-200 mb-1">
                                                    <Shield className="mr-2 h-4 w-4 text-blue-500" /> Edit Access
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(user._id)} className="cursor-pointer text-red-600 focus:text-red-700 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-950/20 bg-red-50 dark:bg-red-950/10">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <UserDetailDialog 
                open={isDetailOpen} 
                onOpenChange={setIsDetailOpen} 
                user={selectedUser} 
            />

            <EditUserDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                user={selectedUser} 
            />

            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete User"
                description="Are you sure you want to delete this user? This action is irreversible and will remove all their data."
                onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete)}
                isLoading={deleteMutation.isPending}
                variant="destructive"
            />
        </div>
    );
}
