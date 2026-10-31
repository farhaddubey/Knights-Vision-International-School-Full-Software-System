import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/src/lib/prisma';
import { getPanelAuthorizationForUserId, setSchoolSessionCookie } from '@/src/lib/rbac/authorization';
import { canAccessStaffPanel, getStaffPanelDestination, panelPath } from '@/src/lib/rbac/panelAccess';
import { STAFF_SESSION_JWT_EXPIRES_IN } from '@/src/lib/rbac/session';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || user.blocked === true || user.is_active === false) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const authorization = await getPanelAuthorizationForUserId(user.id);
    if (!canAccessStaffPanel(authorization, "FACULTIES")) {
      const destination = getStaffPanelDestination(authorization);
      return NextResponse.json(
        {
          error: 'This account is not permitted to use the faculties panel.',
          panel: destination,
          redirectTo: destination ? panelPath(destination) : null,
        },
        { status: 403 },
      );
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Generate JWT
    const faculties_token = jwt.sign(
      {
        id: user.id,
        panel: "FACULTIES",
        email: user.email,
        role: user.role,
        department: user.department,
        brand_name: 'Knights (KiREAD) Group',
        logo_url: 'Knights (KiREAD) Group',
      },
      process.env.JWT_SECRET,
      { expiresIn: STAFF_SESSION_JWT_EXPIRES_IN }
    );

    const response = NextResponse.json({ faculties_token }, { status: 200 });
    setSchoolSessionCookie(response, faculties_token, "FACULTIES");
    return response;
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma Client to avoid connection leaks
    await prisma.$disconnect();
  }
}

// Optional: Disable prerendering for API routes
export const dynamic = 'force-dynamic';
