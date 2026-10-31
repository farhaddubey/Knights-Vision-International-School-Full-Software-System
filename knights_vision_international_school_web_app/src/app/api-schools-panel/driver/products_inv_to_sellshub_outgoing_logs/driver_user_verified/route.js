import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

function safeJson(obj) {
    try {
      return JSON.parse(
        JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
      );
    } catch (err) {
      console.error('❌ Error in safeJson():', err);
      return { error: 'Failed to serialize JSON safely' };
    }
  }
  
// ✅ GET All Logs
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // if (!user_id) {
    //   return NextResponse.json({ error: "Missing factory_id in request" }, { status: 400 });
    // }
    console.log("Final where condition:", { assigned_driver_id: parseInt(user_id), verified: true });

    const logs = await prisma.products_inv_to_sellshub_outgoing_logs.findMany({
      where: {
        assigned_driver_id: parseInt(user_id),
        verified: true
      },
      select: {
        id: true,
        date: true,
        factory_id: true,
        fac_inventory_id: true,
        sales_center_id: true,
        dispatched_by_id: true,
        assigned_driver_id: true,
        final_product_id: true,
        unit_dispatched: true,
        dispatched_weight: true,
        salesHub_received_weight: true,
        salesHub_remarks: true,
        salesHub_otp: true,
        salesHub_verified: true,
        factory: {
          select: {
            factory_name: true
          }
        },
        sales_center: {
          select: {
            sales_hub_name: true
          }
        },
        dispatched_by: {
          select: {
            username: true
          }
        },
        assigned_driver: {
          select: {
            username: true
          }
        },
        final_product: {
          select: {
            product_name: true,
            product_model: true
          }
        }
      }
    });
    
    return NextResponse.json(safeJson(logs));
}
