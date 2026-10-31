import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { readSchoolMedia } from "@/src/lib/media/backblazeMedia";
import {
  assertEvidenceAdministrator,
  assertEvidenceScope,
  assertEvidenceSubmitter,
  isEvidenceAdministrator,
} from "@/src/lib/media/schoolMediaEvidence";
import { PanelAuthorizationError, getPanelAuthorization, hasPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const authorization = await getPanelAuthorization(request);
    if (!authorization || !hasPermission(authorization, "evidence.read")) {
      throw new PanelAuthorizationError(401, "Authentication is required to view school evidence.");
    }
    const id = Number((await context.params)?.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new PanelAuthorizationError(400, "A valid evidence record id is required.");
    }
    const evidence = await prisma.schoolMediaEvidence.findUnique({
      where: { id },
      include: { file: true },
    });
    if (!evidence) return NextResponse.json({ error: "Evidence record not found." }, { status: 404 });

    if (isEvidenceAdministrator(authorization)) {
      assertEvidenceAdministrator(authorization);
      assertEvidenceScope(authorization, evidence);
    } else {
      assertEvidenceSubmitter(authorization);
      if (evidence.submittedById !== authorization.user.id) {
        throw new PanelAuthorizationError(403, "Faculty may view only evidence they submitted.");
      }
      assertEvidenceScope(authorization, evidence);
    }

    const media = await readSchoolMedia(evidence.file);
    return new NextResponse(media.content, {
      status: 200,
      headers: {
        "Content-Type": media.contentType,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Faculty evidence file]", error);
    return NextResponse.json({ error: "Unable to read evidence media." }, { status: 500 });
  }
}
