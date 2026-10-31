import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

function requireSecret() {
  if (!SECRET) throw new Error("JWT_SECRET is required for authentication.");
  return SECRET;
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    requireSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, requireSecret());
}
