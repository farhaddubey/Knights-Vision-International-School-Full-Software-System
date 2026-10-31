import {
  guardianCommunicationError,
  listCommunicationStudents,
} from "@/src/lib/communications/scopedGuardianCommunication";

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    return await listCommunicationStudents(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to fetch communication students.");
  }
}
