import { getOwnHomeworkStatus, rejectHomeworkStatusWrite } from "@/src/lib/student/homeworkStatus";

export async function GET(request) {
  return getOwnHomeworkStatus(
    request,
    request.nextUrl.searchParams.get("classSubjectId"),
    request.nextUrl.searchParams.get("studentId"),
  );
}

export async function POST(request) {
  return rejectHomeworkStatusWrite(request);
}
