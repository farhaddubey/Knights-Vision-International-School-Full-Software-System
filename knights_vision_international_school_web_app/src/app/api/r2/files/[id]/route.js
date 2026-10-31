import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { isManagedBackblazeMedia, mediaApiUrl, mediaVisibility, removeSchoolMedia } from "@/src/lib/media/backblazeMedia";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";

function fileIdFrom(params) {
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id <= 0) throw new PanelAuthorizationError(400, "A valid file id is required.");
  return id;
}

export async function DELETE(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "media.manage");
    const params = await context.params;
    const id = fileIdFrom(params);
    const file = await prisma.files.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    await removeSchoolMedia(file);
    await prisma.files.delete({ where: { id } });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "MEDIA_DELETE", resource: "media_file", resourceId: id, metadata: { name: file.name } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    const message = error instanceof Error ? error.message : "Unable to delete this image.";
    return NextResponse.json({ error: message }, { status: error?.code === "LEGACY_MEDIA" ? 409 : 500 });
  }
}

export async function GET(request, context) {
  try {
    await requirePanelPermission(request, "media.manage");
    const params = await context.params;
    const id = fileIdFrom(params);
    const file = await prisma.files.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    return NextResponse.json({
      id: file.id,
      name: file.name,
      mime: file.mime,
      size: Number(file.size),
      key: file.key,
      url: isManagedBackblazeMedia(file) ? mediaApiUrl(file.id) : file.url,
      visibility: mediaVisibility(file),
      managed: isManagedBackblazeMedia(file),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    return NextResponse.json({ error: "Unable to read image metadata." }, { status: 500 });
  }
}
