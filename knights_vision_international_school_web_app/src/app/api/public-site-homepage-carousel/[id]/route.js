import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requiredCarouselImageUrl } from "@/src/lib/media/carouselValidation";
import { PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

function idFrom(params) {
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id <= 0) throw new PanelAuthorizationError(400, "A valid carousel item id is required.");
  return id;
}

function optionalText(value, max) {
  const text = String(value || "").trim();
  return text ? text.slice(0, max) : null;
}

export async function PUT(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "website.manage");
    const id = idFrom(await context.params);
    const body = await request.json();
    const before = await prisma.public_site_homepage_carousel.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: "Carousel item not found." }, { status: 404 });
    const item = await prisma.public_site_homepage_carousel.update({
      where: { id },
      data: {
        img_url: requiredCarouselImageUrl(body?.img_url),
        title: optionalText(body?.title, 80),
        subtitle: optionalText(body?.subtitle, 120),
      },
    });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "PUBLIC_CAROUSEL_UPDATE", resource: "public_site_homepage_carousel", resourceId: id, beforeData: before, afterData: item });
    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    const message = error instanceof Error ? error.message : "Unable to update carousel item.";
    return NextResponse.json({ error: message }, { status: /image|required|URL/i.test(message) ? 400 : 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "website.manage");
    const id = idFrom(await context.params);
    const item = await prisma.public_site_homepage_carousel.delete({ where: { id } });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "PUBLIC_CAROUSEL_DELETE", resource: "public_site_homepage_carousel", resourceId: id, beforeData: item });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    return NextResponse.json({ error: "Unable to delete carousel item." }, { status: 500 });
  }
}
