import {
  guardianCommunicationError,
  listCommunicationStudents,
} from "@/src/lib/communications/scopedGuardianCommunication";

export async function GET(request) {
  try {
    const className = new URL(request.url).searchParams.get("className");
    return await listCommunicationStudents(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to fetch communication students.");
  }
}
