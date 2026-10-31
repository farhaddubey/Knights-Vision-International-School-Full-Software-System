import { NextRequest, NextResponse } from "next/server";
import { authorizationErrorResponse, getPanelAuthorization } from "@/src/lib/rbac/authorization";
import { canAccessStaffPanel, getStaffPanelDestination, panelPath } from "@/src/lib/rbac/panelAccess";
export async function GET(req: NextRequest) {
  try {
    const authorization = await getPanelAuthorization(req, "ADMINISTRATION");
    if (!authorization) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 });
    }
    if (!canAccessStaffPanel(authorization, "ADMINISTRATION")) {
      const destination = getStaffPanelDestination(authorization);
      return NextResponse.json(
        {
          error: "This account is not permitted to use the administration panel.",
          panel: destination,
          redirectTo: destination ? panelPath(destination) : null,
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ user: authorization.user, authorization }, { status: 200 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
