import { NextResponse } from "next/server";
import { authorizationErrorResponse, getPanelAuthorization } from "@/src/lib/rbac/authorization";
import { hasTemporaryFullAdministrationAccess } from "@/src/lib/rbac/temporaryFullAdministration";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const requestedPanel = String(request.headers.get("x-ssps-panel") || "").trim().toUpperCase();
    const expectedPanel = (requestedPanel === "ADMINISTRATION" || requestedPanel === "FACULTIES"
      ? requestedPanel
      : undefined) as "ADMINISTRATION" | "FACULTIES" | undefined;
    const authorization = await getPanelAuthorization(request, expectedPanel);
    if (!authorization) {
      return NextResponse.json({ success: false, message: "Authentication is required." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...authorization,
        features: {
          temporaryFullAdministrationNavigation: expectedPanel === "ADMINISTRATION"
            && hasTemporaryFullAdministrationAccess(authorization),
        },
      },
    });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
