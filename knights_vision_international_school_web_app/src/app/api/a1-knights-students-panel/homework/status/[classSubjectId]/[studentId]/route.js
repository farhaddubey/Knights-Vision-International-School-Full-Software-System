import { getOwnHomeworkStatus, rejectHomeworkStatusWrite } from "@/src/lib/student/homeworkStatus";

export async function GET(request, { params }) {
  return getOwnHomeworkStatus(request, params.classSubjectId, params.studentId);
}

export async function POST(request) {
  return rejectHomeworkStatusWrite(request);
}
