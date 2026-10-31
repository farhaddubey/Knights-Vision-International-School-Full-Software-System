"use client";

import Cookies from "js-cookie";

export const ADMINISTRATION_TOKEN_COOKIE = "administration_token";
export const FACULTIES_TOKEN_COOKIE = "faculties_token";
export const STUDENT_TOKEN_COOKIE = "student_token";

/**
 * Shared staff controls are used by both panels. Resolve the token from the
 * current panel path instead of relying on the historical shared `token`
 * cookie, so simultaneous staff sessions cannot overwrite one another.
 */
export function getActiveStaffPanelToken() {
  if (typeof window === "undefined") return undefined;

  if (window.location.pathname.startsWith("/knights-faculties-panel")) {
    return Cookies.get(FACULTIES_TOKEN_COOKIE);
  }

  if (window.location.pathname.startsWith("/administration")) {
    return Cookies.get(ADMINISTRATION_TOKEN_COOKIE);
  }

  return undefined;
}
