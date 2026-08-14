"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import jsPDF from "jspdf";
import {
  Activity,
  Calendar,
  Download,
  FileText,
  Pill,
  Search,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { medicalRecordService, MedicalRecord } from "@/lib/services/medicalRecordService";

const downloadRecordPdf = (record: MedicalRecord) => {
  const doc = new jsPDF();
  const doctorName = record.doctorId?.userId?.name || "Doctor";
  const clinicName = record.appointmentId?.clinicId?.name || "Curevo Clinic";

  doc.setFontSize(18);
  doc.text("Curevo Medical Record", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 26);

  doc.setFontSize(12);
  doc.text(`Patient: ${record.patientId?.name || "-"}`, 14, 42);
  doc.text(`Doctor: ${doctorName}`, 14, 50);
  doc.text(`Clinic: ${clinicName}`, 14, 58);
  doc.text(`Visit: ${record.appointmentId?.date ? format(new Date(record.appointmentId.date), "PPP") : "-"}`, 14, 66);

  let y = 82;
  doc.setFontSize(14);
  doc.text("Diagnosis", 14, y);
  y += 8;
  doc.setFontSize(11);
  doc.splitTextToSize(record.diagnosis || "-", 180).forEach((line: string) => {
    doc.text(line, 14, y);
    y += 6;
  });

  y += 6;
  doc.setFontSize(14);
  doc.text("Prescription", 14, y);
  y += 8;
  doc.setFontSize(11);
  if (record.prescription?.length) {
    record.prescription.forEach((item, index) => {
      const text = `${index + 1}. ${item.medicine}${item.dosage ? ` - ${item.dosage}` : ""}${item.frequency ? `, ${item.frequency}` : ""}${item.duration ? `, ${item.duration}` : ""}`;
      doc.text(text, 14, y);
      y += 6;
      if (item.instructions) {
        doc.text(`   ${item.instructions}`, 14, y);
        y += 6;
      }
    });
  } else {
    doc.text("No medicines prescribed.", 14, y);
    y += 6;
  }

  if (record.treatmentPlan) {
    y += 6;
    doc.setFontSize(14);
    doc.text("Treatment Plan", 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.splitTextToSize(record.treatmentPlan, 180).forEach((line: string) => {
      doc.text(line, 14, y);
      y += 6;
    });
  }

  if (record.patientInstructions) {
    y += 6;
    doc.setFontSize(14);
    doc.text("Patient Instructions", 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.splitTextToSize(record.patientInstructions, 180).forEach((line: string) => {
      doc.text(line, 14, y);
      y += 6;
    });
  }

  doc.save(`curevo-record-${record._id}.pdf`);
};

const EMPTY_RECORDS: MedicalRecord[] = [];

export default function PatientRecordsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["medical-records"],
    queryFn: () => medicalRecordService.getRecords(),
  });

  const records: MedicalRecord[] = data?.data ?? EMPTY_RECORDS;
  const filteredRecords = useMemo(() => {
    const query = search.toLowerCase();
    return records.filter((record) => {
      const doctor = record.doctorId?.userId?.name || "";
      const clinic = record.appointmentId?.clinicId?.name || "";
      return [record.diagnosis, record.symptoms, doctor, clinic]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [records, search]);

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">Medical Records</h1>
          <p className="text-muted-foreground font-body">Review prescriptions, diagnoses, and visit summaries.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-56 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredRecords.map((record) => (
            <Card key={record._id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      {record.diagnosis}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {record.appointmentId?.date ? format(new Date(record.appointmentId.date), "PPP") : "Visit date unavailable"}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => downloadRecordPdf(record)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs uppercase text-muted-foreground font-semibold">Doctor</p>
                    <p className="mt-1 text-sm font-medium flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {record.doctorId?.userId?.name || "-"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs uppercase text-muted-foreground font-semibold">Clinic</p>
                    <p className="mt-1 text-sm font-medium">{record.appointmentId?.clinicId?.name || "-"}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-xs uppercase text-muted-foreground font-semibold">Token</p>
                    <p className="mt-1 text-sm font-medium">#{record.appointmentId?.tokenNumber || "-"}</p>
                  </div>
                </div>

                {record.symptoms && (
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" /> Symptoms
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{record.symptoms}</p>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" /> Prescription
                  </p>
                  <div className="mt-2 space-y-2">
                    {record.prescription?.length ? (
                      record.prescription.map((item, index) => (
                        <div key={`${item.medicine}-${index}`} className="rounded-lg bg-muted/30 p-3 text-sm">
                          <div className="font-medium">{item.medicine}</div>
                          <div className="text-muted-foreground">
                            {[item.dosage, item.frequency, item.duration].filter(Boolean).join(" • ") || "Use as directed"}
                          </div>
                          {item.instructions && <div className="text-muted-foreground mt-1">{item.instructions}</div>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No medicines prescribed.</p>
                    )}
                  </div>
                </div>

                {record.followUpDate && (
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Follow up {format(new Date(record.followUpDate), "PPP")}
                  </Badge>
                )}

                {record.patientInstructions && (
                  <div>
                    <p className="text-sm font-semibold">Patient instructions</p>
                    <p className="mt-1 text-sm text-muted-foreground">{record.patientInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-muted/10 py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 h-12 w-12 opacity-40" />
          <p className="text-lg font-medium">No medical records found.</p>
          <p className="text-sm">Completed consultations with a diagnosis will appear here.</p>
        </div>
      )}
    </div>
  );
}
