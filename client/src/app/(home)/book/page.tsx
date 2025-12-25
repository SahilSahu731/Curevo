"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { patientService } from "@/lib/services/patientService";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Stethoscope,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Shield,
  CreditCard,
  FileText,
  Video,
  Building2,
  Star,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  // Get doctor info from URL params
  const doctorId = searchParams.get("doctorId") || "";
  const doctorName = searchParams.get("doctorName") || "";
  const specialization = searchParams.get("specialization") || "";
  const fee = searchParams.get("fee") || "0";
  const clinicId = searchParams.get("clinicId") || "";

  // State
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<"in-person" | "video">("in-person");
  const [symptoms, setSymptoms] = useState("");
  const [patientName, setPatientName] = useState(user?.name || "");
  const [patientPhone, setPatientPhone] = useState(user?.phone || "");
  const [patientEmail, setPatientEmail] = useState(user?.email || "");

  // Fetch doctor details
  const { data: doctorRes, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorService.getDoctor(doctorId),
    enabled: !!doctorId,
  });

  const doctor = doctorRes?.data;

  // Fetch available slots
  const { data: slotsRes, isLoading: isSlotsLoading } = useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: () =>
      date
        ? doctorService.getAvailableSlots(doctorId, format(date, "yyyy-MM-dd"))
        : Promise.resolve({ data: [] }),
    enabled: !!date && !!doctorId,
  });

  const slots = slotsRes?.data || [];

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: patientService.bookAppointment,
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
      setStep(4); // Go to success step
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to book appointment");
    },
  });

  const handleConfirmBooking = () => {
    if (!user) {
      toast.error("Please login to book an appointment");
      router.push(`/login?redirect=/book?doctorId=${doctorId}`);
      return;
    }

    if (!date || !selectedSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    bookMutation.mutate({
      doctorId,
      clinicId: doctor?.clinicId?._id || clinicId,
      date: date,
      slotTime: selectedSlot,
      symptoms: symptoms,
      consultationType,
    });
  };

  const canProceedStep1 = date && selectedSlot;
  const canProceedStep2 = symptoms.trim().length > 0;
  const canProceedStep3 = patientName && patientEmail;

  if (!doctorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">No Doctor Selected</h2>
          <p className="text-muted-foreground mb-6">
            Please select a doctor from the doctors page to book an appointment.
          </p>
          <Link href="/doctors">
            <Button>Browse Doctors</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/doctors/${doctorId}`}>
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Doctor Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Book Appointment</h1>
          <p className="text-muted-foreground mt-1">Complete the steps below to schedule your visit</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: "Select Time" },
              { num: 2, label: "Details" },
              { num: 3, label: "Confirm" },
              { num: 4, label: "Done" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= s.num
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      step >= s.num ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 rounded ${
                      step > s.num ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Date & Time */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-emerald-600" />
                        Select Date & Time
                      </CardTitle>
                      <CardDescription>Choose your preferred appointment slot</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Consultation Type */}
                      <div className="space-y-3">
                        <Label>Consultation Type</Label>
                        <RadioGroup
                          value={consultationType}
                          onValueChange={(v: string) => setConsultationType(v as "in-person" | "video")}
                          className="grid grid-cols-2 gap-4"
                        >
                          <Label
                            htmlFor="in-person"
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              consultationType === "in-person"
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <RadioGroupItem value="in-person" id="in-person" />
                            <Building2 className="w-5 h-5" />
                            <div>
                              <div className="font-medium">In-Person</div>
                              <div className="text-xs text-muted-foreground">Visit the clinic</div>
                            </div>
                          </Label>
                          <Label
                            htmlFor="video"
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              consultationType === "video"
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <RadioGroupItem value="video" id="video" />
                            <Video className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Video Call</div>
                              <div className="text-xs text-muted-foreground">Online consultation</div>
                            </div>
                          </Label>
                        </RadioGroup>
                      </div>

                      <Separator />

                      {/* Calendar */}
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <Label className="mb-3 block">Select Date</Label>
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                              className="rounded-md"
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <Label className="mb-3 block">Available Slots</Label>
                          {!date ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground bg-slate-100 dark:bg-slate-900 rounded-xl p-8">
                              <p className="text-center">Please select a date first</p>
                            </div>
                          ) : isSlotsLoading ? (
                            <div className="space-y-2">
                              {Array(6)
                                .fill(0)
                                .map((_, i) => (
                                  <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                          ) : slots.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl p-8">
                              <p className="text-center">No slots available for this date</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                              {slots.map((slot: any) => (
                                <button
                                  key={slot.time}
                                  disabled={slot.isBooked}
                                  onClick={() => setSelectedSlot(slot.time)}
                                  className={`py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
                                    selectedSlot === slot.time
                                      ? "bg-emerald-600 text-white border-emerald-600"
                                      : slot.isBooked
                                      ? "bg-slate-100 text-slate-300 cursor-not-allowed line-through"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!canProceedStep1}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Symptoms & Reason */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Reason for Visit
                      </CardTitle>
                      <CardDescription>Help the doctor prepare for your appointment</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label>Describe your symptoms or reason for visit *</Label>
                        <Textarea
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          placeholder="Please describe your symptoms, concerns, or reason for this appointment..."
                          className="h-40 resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          This information helps the doctor understand your condition before the visit.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!canProceedStep2}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Confirm & Pay */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        Confirm Booking
                      </CardTitle>
                      <CardDescription>Review your appointment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 space-y-4">
                        <h4 className="font-semibold text-lg">Appointment Summary</h4>
                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Doctor</span>
                            <span className="font-medium">{doctor?.userId?.name || doctorName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Specialization</span>
                            <span className="font-medium">{doctor?.specialization || specialization}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">{date ? format(date, "EEEE, MMMM d, yyyy") : "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium">{selectedSlot}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline">{consultationType === "video" ? "Video Call" : "In-Person"}</Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-emerald-600">${doctor?.consultationFee || fee}</span>
                          </div>
                        </div>
                      </div>

                      {/* Patient Info */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Patient Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="Your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                              type="email"
                              value={patientEmail}
                              onChange={(e) => setPatientEmail(e.target.value)}
                              placeholder="your@email.com"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Phone (Optional)</Label>
                            <Input
                              value={patientPhone}
                              onChange={(e) => setPatientPhone(e.target.value)}
                              placeholder="+1 234 567 890"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={!canProceedStep3 || bookMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
                      >
                        {bookMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...
                          </>
                        ) : (
                          <>Confirm Booking</>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="text-center py-12">
                    <CardContent className="space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          Appointment Confirmed!
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Your appointment with {doctor?.userId?.name || doctorName} has been successfully booked.
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 max-w-sm mx-auto text-left space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{date ? format(date, "MMM d, yyyy") : ""}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-medium">{selectedSlot}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium capitalize">{consultationType}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/patient-dashboard">
                          <Button className="bg-emerald-600 hover:bg-emerald-700">View My Appointments</Button>
                        </Link>
                        <Link href="/doctors">
                          <Button variant="outline">Book Another</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Doctor Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDoctorLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-emerald-100 dark:border-emerald-900">
                        <AvatarImage src={doctor?.userId?.profileImage} />
                        <AvatarFallback className="text-xl font-bold bg-emerald-50 text-emerald-600">
                          {(doctor?.userId?.name || doctorName)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mt-3">{doctor?.userId?.name || doctorName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {doctor?.specialization || specialization}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="font-medium">4.9</span>
                        <span className="text-xs text-muted-foreground">(120 reviews)</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{doctor?.experience || 10}+ years experience</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor?.clinicId?.name || "Medical Center"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-600">${doctor?.consultationFee || fee}</span>
                        <span className="text-muted-foreground">per visit</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 items-start">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Your booking is secure and protected. Free cancellation up to 24 hours before.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <BookingPageContent />
    </Suspense>
  );
}
