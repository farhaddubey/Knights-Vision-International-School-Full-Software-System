import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
const jwt = require('jsonwebtoken');

async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication token is missing or invalid' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    // Decode and verify the JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const schoolId = decodedToken.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID not found in token' }, { status: 400 });
    }

    const skip = (page - 1) * pageSize;

    // Fetch paginated users, filtered by schoolId
    const users = await prisma.user.findMany({
      where: {
        schoolId: schoolId, // Filter by schoolId
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        username: true,
        email: true,
        department: true,
        role: true,
        aggrement_work_hours_per_day: true,
        base_salary: true,
        extra_per_half_hour_salary: true,
        regular_entry_time: true,
        regular_leave_time: true,
        salary_system: true,
        per_day_bonus_salary: true,
        per_day_salary: true,
      },
      orderBy: { id: 'asc' },
    });

    // Count total users for pagination, filtered by schoolId
    const totalUsers = await prisma.user.count({
      where: {
        schoolId: schoolId,
      },
    });

    // Format users with string conversions
    const formattedUsers = users.map(user => ({
      ...user,
      aggrement_work_hours_per_day: user.aggrement_work_hours_per_day ? user.aggrement_work_hours_per_day.toString() : null,
      base_salary: user.base_salary ? user.base_salary.toString() : null,
      extra_per_half_hour_salary: user.extra_per_half_hour_salary ? user.extra_per_half_hour_salary.toString() : null,
      per_day_bonus_salary: user.per_day_bonus_salary ? user.per_day_bonus_salary.toString() : null,
      per_day_salary: user.per_day_salary ? user.per_day_salary.toString() : null,
      regular_entry_time: user.regular_entry_time ? user.regular_entry_time : null,
      regular_leave_time: user.regular_leave_time ? user.regular_leave_time : null,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: totalUsers,
      page,
      pageSize,
      totalPages: Math.ceil(totalUsers / pageSize),
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch users", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { GET };