import { NextResponse } from "next/server";
import { clearSchoolSessionCookie } from "@/src/lib/rbac/authorization";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully." });
  clearSchoolSessionCookie(response, "ADMINISTRATION");
  return response;
}
