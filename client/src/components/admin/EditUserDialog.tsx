"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminService } from "@/lib/services/adminService";

export function EditUserDialog({ user, open, onOpenChange }: { user: any; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("patient");
  const [status, setStatus] = useState("active");
  const [targetEmail, setTargetEmail] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!user || !open) return;
    setName(user.name || "");
    setPhone(user.phone || "");
    setRole(user.role || "patient");
    setStatus(user.status || "active");
    setTargetEmail("");
    setReason("");
  }, [user, open]);

  const mutation = useMutation({
    mutationFn: () => adminService.updateUser(user._id, { name, phone: phone || undefined, role, status, targetEmail: targetEmail.trim().toLowerCase(), reason }),
    onSuccess: () => {
      toast.success("User access updated and audited");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.error || "User access could not be updated"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit user access</DialogTitle><DialogDescription>Changes require recent MFA and are recorded in the immutable audit trail.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2"><Label htmlFor="admin-edit-name">Name</Label><Input id="admin-edit-name" value={name} minLength={2} maxLength={80} onChange={(event) => setName(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="admin-edit-phone">Phone</Label><Input id="admin-edit-phone" value={phone} placeholder="+919876543210" onChange={(event) => setPhone(event.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="admin-edit-role">Role</Label><Select value={role} onValueChange={setRole}><SelectTrigger id="admin-edit-role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="patient">Patient</SelectItem><SelectItem value="doctor">Doctor</SelectItem><SelectItem value="admin">Administrator</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="admin-edit-status">Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger id="admin-edit-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label htmlFor="admin-edit-confirm">Type {user?.email} to confirm the target</Label><Input id="admin-edit-confirm" value={targetEmail} onChange={(event) => setTargetEmail(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="admin-edit-reason">Reason</Label><Textarea id="admin-edit-reason" minLength={10} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={mutation.isPending || name.trim().length < 2 || targetEmail.trim().toLowerCase() !== user?.email || reason.trim().length < 10} onClick={() => mutation.mutate()}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save audited change</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
