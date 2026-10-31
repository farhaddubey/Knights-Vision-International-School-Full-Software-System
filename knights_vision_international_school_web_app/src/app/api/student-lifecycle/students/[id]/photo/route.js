import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { removeSchoolMedia, readSchoolMedia, storeSchoolMedia } from "@/src/lib/media/backblazeMedia";
import {
  PanelAuthorizationError,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";
import { lifecycleErrorResponse, positiveInteger, studentByIdWithScope } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

function profileFolder(studentId) {
  return `school-media/private/student-profiles-student-${studentId}`;
}

function profileUrl(studentId) {
  return `/api/student-lifecycle/students/${studentId}/photo`;
}

function photoUploadErrorResponse(error) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return lifecycleErrorResponse(error, "Unable to upload the student photo.");
  }
  const message = error instanceof Error ? error.message : "Unable to upload the student photo.";
  const isValidationError = /required|JPEG|PNG|WebP|GIF|between 1 byte|valid image|too large/i.test(message);
  if (!isValidationError) console.error("[Student photo upload]", error);
  return NextResponse.json({ error: isValidationError ? message : "Unable to upload the student photo." }, { status: isValidationError ? 400 : 500 });
}

function scopeOf(student) {
  return {
    scopeType: "CLASS",
    schoolId: student.schoolId,
    branchId: student.branchId,
    classId: student.classId,
  };
}

async function photoFileForStudent(studentId) {
  return prisma.files.findFirst({
    where: { folder_path: profileFolder(studentId) },
    orderBy: { created_at: "desc" },
  });
}

async function assertPhotoReadAccess(request, studentId) {
  let staffAuthorizationError = null;
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true },
    });
    if (!student) throw new PanelAuthorizationError(404, "Student not found.");
    if (!hasScopeAccess(authorization, student)) {
      throw new PanelAuthorizationError(403, "You do not have access to this student photo.");
    }
    return;
  } catch (error) {
    if (!(error instanceof PanelAuthorizationError)) throw error;
    staffAuthorizationError = error;
  }

  try {
    const studentSession = await requireStudentSession(request);
    if (studentSession.student.id !== studentId) {
      throw new StudentAuthorizationError(403, "You may only view your own student photo.");
    }
  } catch (error) {
    // Staff tokens are deliberately not valid student tokens. If a staff
    // session reached this point, preserve its original authorization error.
    if (staffAuthorizationError) throw staffAuthorizationError;
    throw error;
  }
}

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const studentId = positiveInteger(id, "studentId");
    await assertPhotoReadAccess(request, studentId);
    const file = await photoFileForStudent(studentId);
    if (!file) return NextResponse.json({ error: "Student photo not found." }, { status: 404 });

    const { content, contentType } = await readSchoolMedia(file);
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return lifecycleErrorResponse(error, "Unable to load the student photo.");
  }
}

export async function POST(request, context) {
  let uploaded = null;
  try {
    const authorization = await requirePanelPermission(request, "student.manage");
    const { id } = await context.params;
    const student = await studentByIdWithScope(id, authorization);
    const formData = await request.formData();
    const file = formData.get("file");

    // The folder is derived from the scoped student record. Callers never
    // control storage paths or visibility for identity-card photographs.
    uploaded = await storeSchoolMedia({
      file,
      visibility: "private",
      folder: `student-profiles-student-${student.id}`,
      transform: {
        width: 400,
        height: 500,
        fit: "cover",
        withoutEnlargement: false,
        maxOutputBytes: 100 * 1024,
        initialQuality: 86,
        minimumQuality: 42,
      },
    });

    const saved = await prisma.$transaction(async (tx) => {
      const previousFiles = await tx.files.findMany({
        where: { folder_path: profileFolder(student.id) },
      });
      const createdFile = await tx.files.create({
        data: {
          name: uploaded.name,
          mime: uploaded.mime,
          size: uploaded.sizeKb,
          key: uploaded.key,
          url: profileUrl(student.id),
          folder_path: uploaded.folderPath,
          created_by_id: authorization.user.id,
          updated_by_id: authorization.user.id,
        },
      });
      const updatedStudent = await tx.student.update({
        where: { id: student.id },
        data: { profileImageUrl: profileUrl(student.id) },
        select: { id: true, profileImageUrl: true },
      });
      if (previousFiles.length) {
        await tx.files.deleteMany({ where: { id: { in: previousFiles.map((entry) => entry.id) } } });
      }
      return { createdFile, previousFiles, updatedStudent };
    });
    // From this point the uploaded object is the committed profile photo and
    // must never be removed by the error-cleanup path below.
    uploaded = null;

    // Storage deletion happens only after the replacement is committed. A
    // failed cleanup leaves an inaccessible orphan, never a missing profile.
    await Promise.all(saved.previousFiles.map(async (previous) => {
      try {
        await removeSchoolMedia(previous);
      } catch (cleanupError) {
        console.error("[Student photo cleanup]", cleanupError);
      }
    }));

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.student.photo_updated",
      resource: "Student",
      resourceId: student.id,
      scope: scopeOf(student),
      afterData: { fileId: saved.createdFile.id, mime: saved.createdFile.mime, sizeKb: Number(saved.createdFile.size) },
    });

    return NextResponse.json({
      student: saved.updatedStudent,
      photo: { fileId: saved.createdFile.id, url: profileUrl(student.id) },
    }, { status: 201 });
  } catch (error) {
    if (uploaded?.key) {
      try {
        await removeSchoolMedia({ key: uploaded.key, folder_path: uploaded.folderPath });
      } catch (cleanupError) {
        console.error("[Student photo upload cleanup]", cleanupError);
      }
    }
    return photoUploadErrorResponse(error);
  }
}
