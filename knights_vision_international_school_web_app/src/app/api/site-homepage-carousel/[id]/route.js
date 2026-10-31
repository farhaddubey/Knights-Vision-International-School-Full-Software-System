import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requiredCarouselImageUrl } from "@/src/lib/media/carouselValidation";
import { PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

function idFrom(params) {
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id <= 0) throw new PanelAuthorizationError(400, "A valid carousel image id is required.");
  return id;
}

export async function GET(_request, context) {
  try {
    const id = idFrom(await context.params);
    const image = await prisma.site_homepage_carousel.findUnique({ where: { id }, select: { id: true, img_url: true } });
    return image ? NextResponse.json(image) : NextResponse.json({ error: "Image not found." }, { status: 404 });
  } catch (error) {
    const status = error instanceof PanelAuthorizationError ? error.status : 500;
    return NextResponse.json({ error: error.message || "Unable to fetch carousel image." }, { status });
  }
}

export async function PUT(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "website.manage");
    const id = idFrom(await context.params);
    const body = await request.json();
    const before = await prisma.site_homepage_carousel.findUnique({ where: { id }, select: { id: true, img_url: true } });
    if (!before) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    const image = await prisma.site_homepage_carousel.update({ where: { id }, data: { img_url: requiredCarouselImageUrl(body?.img_url) } });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "DASHBOARD_CAROUSEL_UPDATE", resource: "site_homepage_carousel", resourceId: id, beforeData: before, afterData: image });
    return NextResponse.json(image);
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    const message = error instanceof Error ? error.message : "Unable to update carousel image.";
    return NextResponse.json({ error: message }, { status: /image|required|URL/i.test(message) ? 400 : 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "website.manage");
    const id = idFrom(await context.params);
    const image = await prisma.site_homepage_carousel.delete({ where: { id } });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "DASHBOARD_CAROUSEL_DELETE", resource: "site_homepage_carousel", resourceId: id, beforeData: image });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    return NextResponse.json({ error: "Unable to delete carousel image." }, { status: 500 });
  }
}
