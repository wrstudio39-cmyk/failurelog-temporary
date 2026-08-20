import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(_:Request,{params}:{params:{id:string}}){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const {data,error}=await supabase.from("purchases").select("*,listing:listings(title,slug), assets:project_assets(id,label)").eq("id",params.id).or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`).single();
  if(error)return NextResponse.json({error:error.message},{status:404});
  return NextResponse.json({purchase:data,viewerId:user.id});
}
