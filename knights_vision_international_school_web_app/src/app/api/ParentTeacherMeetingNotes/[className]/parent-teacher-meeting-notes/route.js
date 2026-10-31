import {
  createParentTeacherMeetingNotes,
  guardianCommunicationError,
  listParentTeacherMeetingNotes,
} from "@/src/lib/communications/scopedGuardianCommunication";

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    return await listParentTeacherMeetingNotes(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to fetch parent-teacher meeting notes.");
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = await params;
    return await createParentTeacherMeetingNotes(request, className);
  } catch (error) {
    return guardianCommunicationError(error, "Failed to create parent-teacher meeting notes.");
  }
}
