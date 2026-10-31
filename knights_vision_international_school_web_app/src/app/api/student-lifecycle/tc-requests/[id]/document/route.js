import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { lifecycleErrorResponse, tcRequestById } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

function line(document, label, value, y) {
  document.setFont("helvetica", "bold");
  document.text(`${label}:`, 18, y);
  document.setFont("helvetica", "normal");
  document.text(String(value || "Not recorded"), 57, y, { maxWidth: 135 });
}

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { id } = await context.params;
    const tcRequest = await tcRequestById(id, authorization);
    if (tcRequest.status !== "ISSUED" || !tcRequest.tcNumber) {
      return NextResponse.json({ error: "The official TC document is available only after issuance." }, { status: 409 });
    }
    const document = new jsPDF({ unit: "mm", format: "a4" });
    document.setFont("helvetica", "bold");
    document.setFontSize(18);
    document.text("Sure Success Point School", 105, 20, { align: "center" });
    document.setFontSize(10);
    document.setFont("helvetica", "normal");
    document.text("Official Transfer Certificate", 105, 27, { align: "center" });
    document.setDrawColor(30, 100, 60);
    document.line(18, 31, 192, 31);
    document.setFontSize(11);
    let y = 43;
    line(document, "School TC Number", tcRequest.tcNumber, y); y += 10;
    line(document, "Government TC ID", tcRequest.governmentTcId, y); y += 10;
    line(document, "Issue date", tcRequest.issuedAt ? new Date(tcRequest.issuedAt).toLocaleDateString("en-IN") : null, y); y += 10;
    line(document, "Admission number", tcRequest.student.admissionNumber, y); y += 10;
    line(document, "Student", [tcRequest.student.firstName, tcRequest.student.middleName, tcRequest.student.lastName].filter(Boolean).join(" "), y); y += 10;
    line(document, "Guardian", tcRequest.student.guardianName, y); y += 10;
    line(document, "Class at transfer", `Class ID ${tcRequest.classId} · Academic session ${tcRequest.academicYear}`, y); y += 10;
    line(document, "Transfer date", new Date(tcRequest.requestedTransferDate).toLocaleDateString("en-IN"), y); y += 10;
    line(document, "Destination school", tcRequest.destinationSchoolName, y); y += 10;
    line(document, "Destination location", tcRequest.destinationLocation, y); y += 16;
    document.setFont("helvetica", "bold");
    document.text("This certificate records the student's transfer from Sure Success Point School.", 18, y, { maxWidth: 174 });
    y += 33;
    document.setFont("helvetica", "normal");
    document.text("Issued by authorised school authority", 18, y);
    document.line(18, y + 18, 85, y + 18);
    document.text("Authorised signature", 18, y + 24);
    const pdf = document.output("arraybuffer");
    return new NextResponse(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${tcRequest.tcNumber}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to generate the transfer certificate document.");
  }
}
