"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Camera, Download, Edit2, KeyRound, Loader2, Mail, MapPin, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import apiClient from "@/api/client";
import { UpdateProfileDialog } from "@/components/profile/UpdateProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileImage } from "@/lib/services/authService";
import { useAuthStore } from "@/store/authStore";

const initials = (name = "") => name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2) || "U";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [privacyPending, setPrivacyPending] = useState(false);

  const imageMutation = useMutation({
    mutationFn: updateProfileImage,
    onSuccess: (updatedUser) => { setUser(updatedUser); toast.success("Profile photo updated"); closePhoto(); },
    onError: () => toast.error("Could not update your photo"),
  });

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file); setSelectedFile(file); setPreview(url); setPhotoOpen(true); event.target.value = "";
  }
  function closePhoto() { if (preview) URL.revokeObjectURL(preview); setPhotoOpen(false); setPreview(null); setSelectedFile(null); }
  function uploadPhoto() { if (!selectedFile) return; const data = new FormData(); data.append("image", selectedFile); imageMutation.mutate(data); }

  async function downloadData() {
    setPrivacyPending(true);
    try { const response = await apiClient.get("/auth/export", { responseType: "blob" }); const url = URL.createObjectURL(response.data); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `curevo-export-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); toast.success("Account export downloaded"); } catch { toast.error("Account export failed"); } finally { setPrivacyPending(false); }
  }
  async function deleteAccount() {
    setPrivacyPending(true);
    try { await apiClient.delete("/auth/account", { data: { confirmEmail: deleteEmail, password: deletePassword } }); await logout(); router.replace("/"); toast.success("Account deleted"); } catch (error: unknown) { const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error; toast.error(message || "Account deletion failed"); } finally { setPrivacyPending(false); }
  }

  const location = [user?.address?.city, user?.address?.country].filter(Boolean).join(", ") || "Location not added";
  return <div className="mx-auto max-w-7xl space-y-7"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Account</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Your space, your information.</h1><p className="mt-3 max-w-2xl text-muted-foreground">Manage the details that identify your account and the data you choose to keep in Curevo.</p></div><div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><Card className="relative overflow-hidden rounded-[2rem]"><div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/5" /><CardContent className="relative flex flex-col gap-7 p-7 sm:flex-row sm:items-center sm:p-9"><div className="relative shrink-0"><Avatar className="size-32 border-4 border-background shadow-xl"><AvatarImage src={user?.profileImage || ""} alt="" /><AvatarFallback className="bg-primary/10 text-3xl font-semibold text-primary">{initials(user?.name)}</AvatarFallback></Avatar><button onClick={() => fileRef.current?.click()} aria-label="Change profile photo" className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground"><Camera className="size-4" /></button><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={choosePhoto} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="truncate text-3xl font-semibold">{user?.name}</h2><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4" />{user?.email}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />{location}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{user?.bio || "Add a short note about what you want this space to support."}</p><Button variant="outline" className="mt-5 rounded-full" onClick={() => setEditOpen(true)}><Edit2 className="mr-2 size-4" />Edit profile</Button></div></CardContent></Card><Card className="rounded-[2rem] bg-[#284c3c] text-white"><CardHeader><ShieldCheck className="size-5 text-[#f4c66f]" /><CardTitle className="mt-3 text-white">Account safety</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold">Email verification</p><p className="mt-1 text-white/65">{user?.emailVerifiedAt ? "Verified" : "Still needs verification"}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="font-semibold">Multi-factor authentication</p><p className="mt-1 text-white/65">{user?.mfa?.enabled ? "Enabled" : "Not enabled"}</p></div><Button asChild variant="secondary" className="w-full rounded-full"><a href="/mfa-setup"><KeyRound className="mr-2 size-4" />Manage MFA</a></Button></CardContent></Card></div><div className="grid gap-6 lg:grid-cols-2"><Card className="rounded-[2rem]"><CardHeader><UserRound className="size-5 text-primary" /><CardTitle className="mt-3">Personal details</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2">{[["Member since", format(new Date(user?.createdAt || new Date()), "MMMM yyyy")], ["Phone", user?.phone || "Not added"], ["Date of birth", user?.dateOfBirth ? format(new Date(user.dateOfBirth), "MMMM d, yyyy") : "Not added"], ["Location", location]].map(([label, value]) => <div key={label}><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>)}</CardContent></Card><Card className="rounded-[2rem]"><CardHeader><ShieldCheck className="size-5 text-primary" /><CardTitle className="mt-3">Privacy controls</CardTitle><p className="text-sm text-muted-foreground">Your export contains account details, focus sessions, routines, reflections, feedback, and notifications.</p></CardHeader><CardContent className="space-y-3"><Button variant="outline" className="w-full justify-start rounded-full" disabled={privacyPending} onClick={downloadData}><Download className="mr-2 size-4" />Download my data</Button><Button variant="destructive" className="w-full justify-start rounded-full" disabled={privacyPending} onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 size-4" />Delete my account and data</Button></CardContent></Card></div><UpdateProfileDialog open={editOpen} onOpenChange={setEditOpen} user={user} /><Dialog open={photoOpen} onOpenChange={(open) => { if (!open) closePhoto(); }}><DialogContent><DialogHeader><DialogTitle>Use this profile photo?</DialogTitle><DialogDescription>Images are resized and stored with your account.</DialogDescription></DialogHeader><div className="grid place-items-center py-6"><Avatar className="size-44"><AvatarImage src={preview || ""} alt="Profile preview" /><AvatarFallback>{initials(user?.name)}</AvatarFallback></Avatar></div><DialogFooter><Button variant="outline" onClick={closePhoto}>Cancel</Button><Button disabled={imageMutation.isPending} onClick={uploadPhoto}>{imageMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}Save photo</Button></DialogFooter></DialogContent></Dialog><Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent><DialogHeader><DialogTitle>Delete this account?</DialogTitle><DialogDescription>This permanently removes your focus sessions, routines, reflections, feedback, notifications, and personal account data. This cannot be undone.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="delete-email">Type {user?.email} to confirm</Label><Input id="delete-email" value={deleteEmail} onChange={(event) => setDeleteEmail(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="delete-password">Current password <span className="font-normal text-muted-foreground">(leave blank for Google accounts)</span></Label><Input id="delete-password" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} /></div></div><DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" disabled={privacyPending || deleteEmail.trim().toLowerCase() !== user?.email.toLowerCase()} onClick={deleteAccount}>{privacyPending ? "Deleting..." : "Permanently delete"}</Button></DialogFooter></DialogContent></Dialog></div>;
}
