"use client";

import { LabTest } from "@/lib/services/labService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed as per previous file list

interface BookTestModalProps {
  test: LabTest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookTestModal({ test, isOpen, onClose }: BookTestModalProps) {
  const [loading, setLoading] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!test) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    
    toast.success(`Successfully booked ${test.name}! We will contact you soon.`);
    onClose();
  };

  if (!test) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {test.name}</DialogTitle>
          <DialogDescription>
            Enter your details to schedule a home sample collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleBooking}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" placeholder="John Doe" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" placeholder="+91 98765 43210" className="col-span-3" required type="tel"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input id="date" type="date" className="col-span-3" required />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg mt-2">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Test Price</span>
                    <span className="font-medium">₹{test.price}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Home Collection</span>
                    <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{test.price}</span>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
