import authSeller from "@/middleware/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
//add a new product 
 
 
export async function POST(){
    try{
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized '}, {status: 401})
        }

        //get data from the form 
        const formData = await request.formData()
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = formData.get("name")
        
    } catch(error){

    }
}