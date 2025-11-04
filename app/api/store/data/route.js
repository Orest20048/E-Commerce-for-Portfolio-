import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";



// get store info and store products 
export async function GET(request) {
    try {
        //Get store username from querry params 
        const {searchParams} = new URL(request.url)
        const username = searchParams.get('username').toLowerCase();

        if(!username){
            return NextResponse.json({error: "missing usernama"}, {status: 400})
        }
        //Get store info and inStock products with ratings
        const store = await prisma.store.findUnique({
            where: {username,isActive: true},
            include: {Product: {include: true}}
        })

        if(!store){
            return NextResponse.json({error: "store not found"}, {status:400})
        }
        return NextResponse.json({store})
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code|| error.message}, {status: 400})

    }
}