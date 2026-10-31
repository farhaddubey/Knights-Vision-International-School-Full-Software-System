import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requiredCarouselImageUrl } from "@/src/lib/media/carouselValidation";
import { PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

function pageNumber(value, fallback) {
  const number = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

// Dashboard carousel remains readable by its existing panels. Mutations are
// Administration-only and permission-checked below.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = pageNumber(searchParams.get("page"), 1);
    const pageSize = Math.min(pageNumber(searchParams.get("pageSize"), 10), 50);
    const [images, total] = await Promise.all([
      prisma.site_homepage_carousel.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, img_url: true },
        orderBy: { id: "asc" },
      }),
      prisma.site_homepage_carousel.count(),
    ]);
    return NextResponse.json({ images, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    console.error("[Dashboard carousel list]", error);
    return NextResponse.json({ error: "Unable to fetch carousel images." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authorization = await requireAdministrationPermission(request, "website.manage");
    const body = await request.json();
    const entries = Array.isArray(body) ? body : [body];
    if (entries.length === 0 || entries.length > 20) throw new PanelAuthorizationError(400, "Provide between 1 and 20 carousel images.");
    const created = await prisma.site_homepage_carousel.createMany({
      data: entries.map((entry) => ({ img_url: requiredCarouselImageUrl(entry?.img_url) })),
    });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "DASHBOARD_CAROUSEL_CREATE", resource: "site_homepage_carousel", metadata: { count: created.count } });
    return NextResponse.json({ success: true, count: created.count }, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    const message = error instanceof Error ? error.message : "Unable to save carousel images.";
    return NextResponse.json({ error: message }, { status: /image|required|URL/i.test(message) ? 400 : 500 });
  }
}
