import {
  createGuardianCallLogs,
  guardianCommunicationError,
  listGuardianCallLogs,
} from "@/src/lib/communications/scopedGuardianCommunication";

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    return await listGuardianCallLogs(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to fetch guardian call logs.");
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = await params;
    return await createGuardianCallLogs(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to create guardian call logs.");
  }
}
