/**
 * Staff sessions intentionally have a finite, predictable lifetime.  The
 * browser cookie, client-held bearer token, and signed JWT must agree so a
 * faculty member is not unexpectedly signed out before the advertised window.
 */
export const STAFF_SESSION_DAYS = 7;
export const STAFF_SESSION_TTL_SECONDS = STAFF_SESSION_DAYS * 24 * 60 * 60;
export const STAFF_SESSION_JWT_EXPIRES_IN = `${STAFF_SESSION_DAYS}d`;
