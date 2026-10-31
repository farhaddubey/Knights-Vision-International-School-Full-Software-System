import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number; // customerId
  iat?: number; // Issued at
  exp?: number; // Expiry
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, secret) as JwtPayload;
    if (!decoded.id) {
      throw new Error('Invalid token payload: missing id');
    }

    return { id: decoded.id };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null; // Return null for invalid/expired tokens
  }
}