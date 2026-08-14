"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorService } from "@/lib/services/doctorService";
import { clinicService } from "@/lib/services/clinicService";
import { patientService } from "@/lib/services/patientService";
import { formatCurrency } from "@/lib/localization";
import { useAuthStore } from "@/store/authStore";
import { addDays, format } from "date-fns";
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
  ClipboardCheck,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function BookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Get doctor info from URL params
  const doctorId = searchParams.get("doctorId") || "";
  const requestedClinicId = searchParams.get("clinicId") || "";

  // State
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(() => {
    const requestedDate = searchParams.get("date");
    return requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      ? new Date(`${requestedDate}T12:00:00`)
      : undefined;
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(() => searchParams.get("slot"));
  const [consultationType, setConsultationType] = useState<"in-person" | "video">(() => searchParams.get("type") === "video" ? "video" : "in-person");
  const [symptoms, setSymptoms] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [bookingConflict, setBookingConflict] = useState<string | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [submissionAttempted, setSubmissionAttempted] = useState(false);

  // Fetch doctor details
  const { data: doctorRes, isLoading: isDoctorLoading, isError: isDoctorError, refetch: refetchDoctor } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorService.getDoctor(doctorId),
    enabled: !!doctorId,
  });

  const doctor = doctorRes?.data;
  const assignedClinicId = doctor?.clinicId?._id || "";

  const { data: clinicRes, isError: isClinicError, refetch: refetchClinic } = useQuery({
    queryKey: ["clinic", assignedClinicId],
    queryFn: () => clinicService.getClinic(assignedClinicId),
    enabled: Boolean(assignedClinicId),
  });
  const clinic = clinicRes?.data;
  const supportedTypes: Array<"in-person" | "video"> = clinic?.supportedConsultationTypes || ["in-person", "video"];
  const clinicMismatch = Boolean(requestedClinicId && assignedClinicId && requestedClinicId !== assignedClinicId);

  // Fetch available slots
  const { data: slotsRes, isLoading: isSlotsLoading } = useQuery({
    queryKey: ["slots", doctorId, date, consultationType],
    queryFn: () =>
      date
        ? doctorService.getAvailableSlots(doctorId, format(date, "yyyy-MM-dd"), consultationType)
        : Promise.resolve({ data: [] }),
    enabled: !!date && !!doctorId,
  });

  const slots = slotsRes?.data || [];

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: patientService.bookAppointment,
    onSuccess: () => {
      toast.success("Appointment created");
      setStep(4); // Go to success step
    },
  });

  const updateIntent = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (assignedClinicId) next.set("clinicId", assignedClinicId);
    router.replace(`/book?${next.toString()}`, { scroll: false });
  };

  const chooseDate = (nextDate?: Date) => {
    setDate(nextDate);
    setSelectedSlot(null);
    setBookingConflict(null);
    setSubmissionAttempted(false);
    updateIntent({ date: nextDate ? format(nextDate, "yyyy-MM-dd") : null, slot: null });
  };

  const chooseType = (value: "in-person" | "video") => {
    setConsultationType(value);
    setSelectedSlot(null);
    setBookingConflict(null);
    setSubmissionAttempted(false);
    updateIntent({ type: value, slot: null });
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error("Please login to book an appointment");
      router.push(`/login?redirect=${encodeURIComponent(`/book?${searchParams.toString()}`)}`);
      return;
    }

    if (!date || !selectedSlot) {
      toast.error("Please select a date and time slot");
      return;
    }

    if (!assignedClinicId || !clinic || !supportedTypes.includes(consultationType)) {
      toast.error("The selected visit type is not offered by this clinic");
      return;
    }

    setIsRevalidating(true);
    setBookingConflict(null);
    try {
      if (!submissionAttempted) {
        const freshSlots = await doctorService.getAvailableSlots(doctorId, format(date, "yyyy-MM-dd"), consultationType);
        const stillAvailable = freshSlots.data?.some((slot: { time: string }) => slot.time === selectedSlot);
        if (!stillAvailable) {
          await queryClient.invalidateQueries({ queryKey: ["slots", doctorId, date, consultationType] });
          setSelectedSlot(null);
          setStep(1);
          setBookingConflict("That time is no longer available. The latest alternatives are shown below.");
          updateIntent({ slot: null });
          toast.error("Selected time is no longer available");
          return;
        }
      }

      setSubmissionAttempted(true);
      await bookMutation.mutateAsync({
        doctorId,
        clinicId: assignedClinicId,
        date: format(date, "yyyy-MM-dd"),
        slotTime: selectedSlot,
        symptoms,
        consultationType,
        idempotencyKey,
      });
    } catch (error: any) {
      const message = error.response?.data?.error || "The appointment could not be created";
      if (error.response?.status === 409) {
        setSubmissionAttempted(false);
        await queryClient.invalidateQueries({ queryKey: ["slots", doctorId, date, consultationType] });
        setSelectedSlot(null);
        setStep(1);
        setBookingConflict(`${message}. Choose one of the refreshed alternatives.`);
        updateIntent({ slot: null });
      }
      toast.error(error.response ? message : "The connection was interrupted. Retry will safely check the original request.");
    } finally {
      setIsRevalidating(false);
    }
  };

  const canProceedStep1 = date && selectedSlot && supportedTypes.includes(consultationType);
  const canProceedStep2 = symptoms.trim().length > 0;
  const canProceedStep3 = Boolean(user && assignedClinicId && clinic);

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

  if (isDoctorError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg p-6 text-center">
          <h1 className="text-xl font-bold">Doctor details are unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">The provider may no longer accept appointments, or the connection failed.</p>
          <div className="mt-5 flex justify-center gap-3"><Button onClick={() => refetchDoctor()}>Try again</Button><Button asChild variant="outline"><Link href="/doctors">Choose another doctor</Link></Button></div>
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
          <p className="text-muted-foreground mt-1">Review the clinic policies and request an available visit time.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="mx-auto grid max-w-2xl grid-cols-4">
            {[
              { num: 1, label: "Select Time" },
              { num: 2, label: "Details" },
              { num: 3, label: "Confirm" },
              { num: 4, label: "Done" },
            ].map((s, i) => (
              <div key={s.num} className="relative flex min-w-0 justify-center">
                <div className="flex min-w-0 flex-col items-center">
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
                    className={`mt-2 max-w-full text-center text-[11px] font-medium sm:text-xs ${
                      step >= s.num ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 3 && (
                  <div
                    aria-hidden="true"
                    className={`absolute left-[calc(50%+1.25rem)] top-5 h-1 w-[calc(100%-2.5rem)] ${
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
                          onValueChange={(v: string) => chooseType(v as "in-person" | "video")}
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {supportedTypes.includes("in-person") && (
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
                              <div className="font-medium">In-person</div>
                              <div className="text-xs text-muted-foreground">Visit the clinic</div>
                            </div>
                          </Label>
                          )}
                          {supportedTypes.includes("video") && (
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
                              <div className="font-medium">Video visit</div>
                              <div className="text-xs text-muted-foreground">Online consultation</div>
                            </div>
                          </Label>
                          )}
                        </RadioGroup>
                        {clinic && <p className="text-xs text-muted-foreground">Only visit types offered by {clinic.name} are shown.</p>}
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
                              onSelect={chooseDate}
                              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0)) || d > addDays(new Date(), clinic?.bookingHorizonDays || 90)}
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
                              <p className="text-center">{bookingConflict || "No slots available for this date. Choose another date."}</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {bookingConflict && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100" role="alert">{bookingConflict}</p>}
                              <p className="text-xs text-muted-foreground">Times shown in {clinic?.timezone || (slotsRes as any)?.timezone || "the clinic timezone"}.</p>
                              <div className="grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                              {slots.map((slot: any) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={slot.isBooked}
                                  onClick={() => {
                                    setSelectedSlot(slot.time);
                                    setBookingConflict(null);
                                    setSubmissionAttempted(false);
                                    updateIntent({ slot: slot.time });
                                  }}
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
                        <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                        Review appointment
                      </CardTitle>
                      <CardDescription>Review your appointment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      <div className="space-y-4 rounded-md bg-slate-50 p-5 dark:bg-slate-900">
                        <h4 className="font-semibold text-lg">Appointment Summary</h4>
                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Doctor</span>
                            <span className="font-medium">{doctor?.userId?.name || "Unavailable"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Specialization</span>
                            <span className="font-medium">{doctor?.specialization || "Unavailable"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clinic</span>
                            <span className="max-w-[60%] text-right font-medium">{clinic?.name || doctor?.clinicId?.name || "Unavailable"}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Location</span>
                            <span className="max-w-[65%] text-right font-medium">{clinic ? [clinic.address, clinic.city, clinic.state].filter(Boolean).join(", ") : "Unavailable"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">{date ? format(date, "EEEE, MMMM d, yyyy") : "-"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time</span>
                            <span className="text-right font-medium">{selectedSlot} <span className="block text-xs font-normal text-muted-foreground">{clinic?.timezone || "Clinic timezone"}</span></span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <Badge variant="outline">{consultationType === "video" ? "Video visit" : "In-person"}</Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg">
                            <span className="font-semibold">Consultation fee</span>
                            <span className="font-bold text-emerald-600">{formatCurrency(doctor?.consultationFee)}</span>
                          </div>
                          <p className="text-xs leading-5 text-muted-foreground">No payment is collected on this screen. Confirm payment arrangements directly with the clinic.</p>
                        </div>
                      </div>

                      <div className="rounded-md border border-border p-4">
                        <h4 className="font-semibold">Booking account</h4>
                        <p className="mt-1 text-sm text-muted-foreground">This appointment will be associated with the authenticated account on the server.</p>
                        <p className="mt-3 text-sm font-medium text-foreground">{user?.name || "Sign in required"}</p>
                        {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                      </div>

                      <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
                        {clinic?.cancellationNoticeHours === 0
                          ? "The clinic currently lists no advance cancellation notice requirement. Contact the clinic if plans change."
                          : `The clinic requires at least ${clinic?.cancellationNoticeHours ?? "the listed"} hours' notice for cancellation. Contact the clinic to confirm any fees or exceptions.`}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={!canProceedStep3 || bookMutation.isPending || isRevalidating}
                        className="bg-emerald-600 hover:bg-emerald-700 min-w-[150px]"
                      >
                        {bookMutation.isPending || isRevalidating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isRevalidating && !bookMutation.isPending ? "Checking slot..." : "Creating..."}
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
                          Appointment created
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          The server accepted this appointment with {doctor?.userId?.name || "the selected clinician"} as booked. Review the clinic instructions before your visit.
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
                        <Link href="/patient-dashboard/appointments">
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
                          {(doctor?.userId?.name || "D")?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mt-3">{doctor?.userId?.name || "Unavailable"}</h3>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" />
                        {doctor?.specialization || "Unavailable"}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="font-medium">{doctor?.ratingStats?.averageRating || "New"}</span>
                        <span className="text-xs text-muted-foreground">({doctor?.ratingStats?.reviewCount || 0} reviews)</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{doctor?.experience ?? "Unavailable"}{doctor?.experience !== undefined ? "+ years experience" : ""}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{clinic?.name || doctor?.clinicId?.name || "Unavailable"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-600">{formatCurrency(doctor?.consultationFee)}</span>
                        <span className="text-muted-foreground">per visit</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p><strong className="text-foreground">Verification:</strong> {doctor?.verificationStatus === "approved" ? "Approved clinician profile" : "Unavailable"}</p>
                      <p><strong className="text-foreground">Clinic timezone:</strong> {clinic?.timezone || "Loading..."}</p>
                      <p><strong className="text-foreground">Visit types:</strong> {supportedTypes.map((type) => type === "video" ? "Video" : "In-person").join(", ")}</p>
                      <p><strong className="text-foreground">Cancellation notice:</strong> {clinic?.cancellationNoticeHours !== undefined ? `${clinic.cancellationNoticeHours} hours` : "Loading..."}</p>
                    </div>

                    {(clinicMismatch || isClinicError) && (
                      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100" role="alert">
                        {clinicMismatch ? "The clinic in the link did not match this clinician's assigned clinic. Curevo replaced it with the server-authorized clinic." : "Clinic policy details could not be loaded."}
                        {isClinicError && <Button type="button" variant="link" size="sm" className="h-auto px-1 text-current underline" onClick={() => refetchClinic()}>Retry</Button>}
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 items-start">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        This creates a prototype appointment request. Confirm availability, fees, cancellation terms, and care directly with the clinic.
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
