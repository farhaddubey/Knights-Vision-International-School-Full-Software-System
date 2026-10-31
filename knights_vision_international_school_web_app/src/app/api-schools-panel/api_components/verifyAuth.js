import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export default function verifyAuth(req) {
    try {
        // 🔹 Extract token from headers
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { error: "Unauthorized: No token provided", status: 401 };
        }

        const token = authHeader.split(" ")[1];

        // 🔹 Verify the token
        // JWT signing material must stay server-side.  The public environment
        // prefix makes a secret available to every browser bundle and can also
        // diverge from the secret used by the login route.
        if (!process.env.JWT_SECRET) {
            return { error: "Server authentication is not configured", status: 500 };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded Token:", decoded);

        return { decoded };
    } catch (error) {
        console.error("❌ Token Verification Failed:", error);
        return { error: "Unauthorized: Invalid token", status: 401 };
    }
}
