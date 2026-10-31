import {
  createGuardianCommunicationLogs,
  guardianCommunicationError,
  listGuardianCommunicationLogs,
} from "@/src/lib/communications/scopedGuardianCommunication";

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    return await listGuardianCommunicationLogs(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to fetch guardian communication logs.");
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = await params;
    return await createGuardianCommunicationLogs(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to create guardian communication logs.");
  }
}
