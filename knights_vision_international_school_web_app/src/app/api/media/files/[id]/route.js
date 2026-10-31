import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { isManagedBackblazeMedia, mediaVisibility, readSchoolMedia } from "@/src/lib/media/backblazeMedia";

export const dynamic = "force-dynamic";

function fileIdFrom(params) {
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new PanelAuthorizationError(400, "A valid media file id is required.");
  }
  return id;
}

/**
 * Public website images are served through this controlled route. Private
 * library images require a staff media permission, leaving room for later
 * student-photo scope checks without exposing the Backblaze bucket itself.
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = fileIdFrom(params);
    const file = await prisma.files.findUnique({
      where: { id },
      select: { id: true, key: true, mime: true, folder_path: true },
    });

    if (!file || !isManagedBackblazeMedia(file)) {
      return NextResponse.json({ error: "Media file not found." }, { status: 404 });
    }

    const visibility = mediaVisibility(file);
    if (visibility !== "public") {
      await requirePanelPermission(request, "media.manage");
    }

    const { content, contentType } = await readSchoolMedia(file);
    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": visibility === "public" ? "public, max-age=31536000, immutable" : "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Media file read]", error);
    return NextResponse.json({ error: "Unable to load this media file." }, { status: 500 });
  }
}
