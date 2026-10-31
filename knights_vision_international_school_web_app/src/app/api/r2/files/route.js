import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  isManagedBackblazeMedia,
  mediaApiUrl,
  mediaVisibility,
  normalizeVisibility,
  removeSchoolMedia,
  storeSchoolMedia,
} from "@/src/lib/media/backblazeMedia";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 60;

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function fileView(file) {
  const managed = isManagedBackblazeMedia(file);
  return {
    id: file.id,
    name: file.name,
    mime: file.mime,
    size: Number(file.size),
    key: file.key,
    url: managed ? mediaApiUrl(file.id) : file.url,
    visibility: mediaVisibility(file),
    managed,
    folderPath: file.folder_path || null,
    createdAt: file.created_at,
    createdBy: file.created_by
      ? { id: file.created_by.id, username: file.created_by.username, email: file.created_by.email }
      : null,
  };
}

function listFilter(visibility, query) {
  const where = {};
  const normalizedQuery = String(query || "").trim().slice(0, 100);

  if (visibility === "public") {
    where.folder_path = { startsWith: "school-media/public/" };
  } else if (visibility === "private") {
    where.folder_path = { startsWith: "school-media/private/" };
  } else if (visibility === "legacy") {
    where.OR = [{ folder_path: null }, { NOT: { folder_path: { startsWith: "school-media/" } } }];
  }

  if (normalizedQuery) {
    const search = { name: { contains: normalizedQuery, mode: "insensitive" } };
    if (where.OR) {
      where.AND = [{ OR: where.OR }, search];
      delete where.OR;
    } else {
      Object.assign(where, search);
    }
  }

  return where;
}

export async function GET(request) {
  try {
    await requirePanelPermission(request, "media.manage");
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(positiveInteger(searchParams.get("pageSize"), 30), MAX_PAGE_SIZE);
    const visibility = String(searchParams.get("visibility") || "all").toLowerCase();
    const where = listFilter(["all", "public", "private", "legacy"].includes(visibility) ? visibility : "all", searchParams.get("q"));
    const skip = (page - 1) * pageSize;

    const [totalFiles, files] = await Promise.all([
      prisma.files.count({ where }),
      prisma.files.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
        include: { created_by: { select: { id: true, username: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      files: files.map(fileView),
      total: totalFiles,
      totalPages: Math.max(1, Math.ceil(totalFiles / pageSize)),
      currentPage: page,
      pageSize,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Media library list]", error);
    return NextResponse.json({ error: "Unable to fetch images." }, { status: 500 });
  }
}

export async function POST(request) {
  let uploaded = null;
  try {
    const authorization = await requirePanelPermission(request, "media.manage");
    const formData = await request.formData();
    const file = formData.get("file");
    const visibility = normalizeVisibility(formData.get("visibility"));
    const folder = String(formData.get("folder") || "library");

    uploaded = await storeSchoolMedia({ file, visibility, folder });
    const created = await prisma.files.create({
      data: {
        name: uploaded.name,
        mime: uploaded.mime,
        size: uploaded.sizeKb,
        key: uploaded.key,
        // The id is not available until this insert. It is replaced immediately
        // below with the controlled same-origin media URL.
        url: "/api/media/files/pending",
        folder_path: uploaded.folderPath,
        created_by_id: authorization.user.id,
        updated_by_id: authorization.user.id,
      },
      include: { created_by: { select: { id: true, username: true, email: true } } },
    });
    const saved = await prisma.files.update({
      where: { id: created.id },
      data: { url: mediaApiUrl(created.id) },
      include: { created_by: { select: { id: true, username: true, email: true } } },
    });

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "MEDIA_UPLOAD",
      resource: "media_file",
      resourceId: saved.id,
      metadata: { name: saved.name, visibility, folder: uploaded.folderPath, sizeKb: Number(saved.size) },
    });

    return NextResponse.json(fileView(saved), { status: 201 });
  } catch (error) {
    if (uploaded?.key) {
      try {
        await removeSchoolMedia({ key: uploaded.key, folder_path: uploaded.folderPath });
      } catch (cleanupError) {
        console.error("[Media upload cleanup]", cleanupError);
      }
    }
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    const message = error instanceof Error ? error.message : "Unable to upload this image.";
    const status = /required|Use a JPEG|between 1 byte|valid image|too large/i.test(message) ? 400 : 500;
    console.error("[Media upload]", error);
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * Legacy clients used DELETE /api/r2/files?fileId=... . Keep that shape while
 * the preferred client path is DELETE /api/r2/files/:id.
 */
export async function DELETE(request) {
  try {
    const authorization = await requirePanelPermission(request, "media.manage");
    const id = Number(new URL(request.url).searchParams.get("fileId"));
    if (!Number.isInteger(id) || id <= 0) {
      throw new PanelAuthorizationError(400, "A valid file id is required.");
    }
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
    const status = error?.code === "LEGACY_MEDIA" ? 409 : 500;
    console.error("[Media delete]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
