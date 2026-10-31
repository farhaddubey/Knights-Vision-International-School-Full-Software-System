import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
    try {
        // Fetch all users with associated factory and machine details
        const users=await prisma.user.findMany({
            select:{
                id:true,
                username:true, 
                email:true,
                sales_center:{
                    select:{
                        id: true, 
                        sales_hub_name:true,
                        office_address:true
                    }
                }, 
                department:true,
                phone1:true,
                phone2:true,
                address:true,
                state:true, 
                country:true,
                pincode:true, 
                fatherName:true, 
                motherName:true, 
                uid_aadhar:true,
                role:true, 
            },
            where: {
                role: "SALES_EXECUTIVE"
            }
        });
        
        
            // 🔹 Convert BigInt fields to string
            const formattedUsers = users.map(user => ({
              ...user,
              uid_aadhar: user.uid_aadhar ? user.uid_aadhar.toString() : null,
              phone1: user.phone1 ? user.phone1.toString() : null,
              phone2: user.phone2 ? user.phone2.toString() : null,
              phone3: user.phone3 ? user.phone3.toString() : null,
            }));
        
            return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, message: 'Error fetching users' }, { status: 500 });
    }
}