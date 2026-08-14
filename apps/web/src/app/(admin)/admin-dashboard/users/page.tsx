"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Shield, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/lib/services/adminService";
import { useAuthStore } from "@/store/authStore";

const initials = (name = "") => name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const canManageAccess = currentUser?.adminScope === "super-admin";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("createdAt:desc");
  const [editing, setEditing] = useState<any>(null);
  const [suspending, setSuspending] = useState<any>(null);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [sortBy, sortOrder] = sort.split(":");

  const usersQuery = useQuery({
    queryKey: ["users", page, search, role, status, sort],
    queryFn: () => adminService.getAllUsers({ page, limit: 20, search: search || undefined, role, status, sortBy, sortOrder }),
  });
  const users = usersQuery.data?.data || [];
  const totalPages = usersQuery.data?.totalPages || 1;

  const suspendMutation = useMutation({
    mutationFn: () => adminService.deleteUser(suspending._id, { targetEmail: confirmation.trim().toLowerCase(), reason }),
    onSuccess: () => {
      toast.success("User suspended; retained records were not deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSuspending(null);
      setConfirmation("");
      setReason("");
    },
    onError: (error: any) => toast.error(error.response?.data?.error || "User could not be suspended"),
  });

  const changeFilter = (setter: (value: string) => void) => (value: string) => { setter(value); setPage(1); };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User management</h1>
        <p className="mt-1 text-muted-foreground">Search accounts, review status, and perform audited access changes.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_180px_210px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input aria-label="Search users" placeholder="Search name or email" className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        </div>
        <Select value={role} onValueChange={changeFilter(setRole)}><SelectTrigger aria-label="Filter by role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem><SelectItem value="patient">Patients</SelectItem><SelectItem value="doctor">Doctors</SelectItem><SelectItem value="admin">Administrators</SelectItem></SelectContent></Select>
        <Select value={status} onValueChange={changeFilter(setStatus)}><SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
        <Select value={sort} onValueChange={changeFilter(setSort)}><SelectTrigger aria-label="Sort users"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt:desc">Newest first</SelectItem><SelectItem value="createdAt:asc">Oldest first</SelectItem><SelectItem value="name:asc">Name A-Z</SelectItem><SelectItem value="name:desc">Name Z-A</SelectItem><SelectItem value="role:asc">Role</SelectItem><SelectItem value="status:asc">Status</SelectItem></SelectContent></Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Scope</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {usersQuery.isLoading && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">Loading users...</TableCell></TableRow>}
            {usersQuery.isError && <TableRow><TableCell colSpan={5} className="h-28 text-center"><p className="text-destructive">Users could not be loaded.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => usersQuery.refetch()}>Retry</Button></TableCell></TableRow>}
            {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 && <TableRow><TableCell colSpan={5} className="h-28 text-center text-muted-foreground">No users match these filters.</TableCell></TableRow>}
            {users.map((user: any) => (
              <TableRow key={user._id}>
                <TableCell><div className="flex items-center gap-3"><Avatar><AvatarImage src={user.profileImage} /><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar><div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{user.role}</Badge></TableCell>
                <TableCell className="capitalize text-muted-foreground">{user.role === "admin" ? user.adminScope || "operations" : "Not applicable"}</TableCell>
                <TableCell><Badge variant={user.status === "suspended" ? "destructive" : "secondary"} className="capitalize">{user.status || "active"}</Badge></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={!canManageAccess} onClick={() => setEditing(user)}><Shield className="mr-2 h-4 w-4" />Edit access</DropdownMenuItem>
                    <DropdownMenuItem disabled={!canManageAccess || user._id === currentUser?._id || user.status === "suspended"} className="text-destructive" onClick={() => setSuspending(user)}><UserX className="mr-2 h-4 w-4" />Suspend account</DropdownMenuItem>
                  </DropdownMenuContent></DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground"><span>{usersQuery.data?.count || 0} users</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label="Previous page" disabled={page <= 1 || usersQuery.isFetching} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /></Button><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" aria-label="Next page" disabled={page >= totalPages || usersQuery.isFetching} onClick={() => setPage((value) => value + 1)}><ChevronRight className="h-4 w-4" /></Button></div></div>

      <EditUserDialog open={Boolean(editing)} onOpenChange={(open: boolean) => !open && setEditing(null)} user={editing} />
      <Dialog open={Boolean(suspending)} onOpenChange={(open) => { if (!open) { setSuspending(null); setConfirmation(""); setReason(""); } }}>
        <DialogContent><DialogHeader><DialogTitle>Suspend {suspending?.name}</DialogTitle><DialogDescription>This revokes active sessions and disables access. Appointments, audit records, and records subject to retention are preserved.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2"><div className="space-y-2"><Label htmlFor="suspend-email">Type {suspending?.email} to confirm</Label><Input id="suspend-email" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="suspend-reason">Reason</Label><Textarea id="suspend-reason" minLength={10} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setSuspending(null)}>Cancel</Button><Button variant="destructive" disabled={suspendMutation.isPending || confirmation.trim().toLowerCase() !== suspending?.email || reason.trim().length < 10} onClick={() => suspendMutation.mutate()}>{suspendMutation.isPending ? "Suspending..." : "Suspend account"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
