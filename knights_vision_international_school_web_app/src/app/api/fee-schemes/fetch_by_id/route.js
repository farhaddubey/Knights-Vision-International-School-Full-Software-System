import { NextResponse } from "next/server";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { financeErrorResponse, scopedFeeScheme } from "@/src/lib/finance/scopedFees";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const id = new URL(request.url).searchParams.get("id");
    const feeScheme = await scopedFeeScheme(authorization, id);
    return NextResponse.json({ feeScheme });
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to fetch fee scheme.");
    return NextResponse.json(response.body, { status: response.status });
  }
}
