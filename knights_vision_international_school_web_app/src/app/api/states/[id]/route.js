import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

import { z } from "zod";

// GET: Retrieve a customer by ID
export async function GET(request, { params }) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session || !["admin", "manager", "customer"].includes(session.user.role)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const customer = await prisma.tdilcs_Customer.findUnique({
      where: { id },
      include: { district: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (session.user.role === "customer" && customer.id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update a customer
export async function PUT(request, { params }) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session || !["admin", "manager"].includes(session.user.role)) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // const body = await request.json();
    // const parsed = updateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const customer = await prisma.tdilcs_Customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updatedCustomer = await prisma.tdilcs_Customer.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a customer
export async function DELETE(request, { params }) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const customer = await prisma.tdilcs_Customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.tdilcs_Customer.delete({ where: { id } });

    return NextResponse.json({ message: "Customer deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
