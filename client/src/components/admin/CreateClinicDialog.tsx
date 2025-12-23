"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, Building2 } from "lucide-react";

export function CreateClinicDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" /> Register Clinic
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                        Register New Clinic
                    </DialogTitle>
                    <DialogDescription>
                        Onboard a new medical facility to the platform.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="clinicName">Clinic Name</Label>
                        <Input id="clinicName" placeholder="e.g. City Care Medical Center" />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Business Email</Label>
                            <Input id="email" placeholder="contact@clinic.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" placeholder="+1 (555) 000-0000" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" placeholder="123 Medical Drive, Suite 100..." />
                     </div>
                     
                     <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input id="license" placeholder="MED-LICENSE-12345" className="font-mono uppercase" />
                     </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={() => setOpen(false)} className="bg-emerald-600">Register Facility</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
