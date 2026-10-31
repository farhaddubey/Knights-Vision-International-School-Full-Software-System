import { getOwnHomeworkStatus, rejectHomeworkStatusWrite } from "@/src/lib/student/homeworkStatus";

export async function GET(request, { params }) {
  return getOwnHomeworkStatus(request, params.classSubjectId, request.nextUrl.searchParams.get("studentId"));
}

export async function POST(request) {
  return rejectHomeworkStatusWrite(request);
}
