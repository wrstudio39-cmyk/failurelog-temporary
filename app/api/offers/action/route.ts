import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {offerId,action,amount,message}=await req.json().catch(()=>({})); const {data:offer}=await supabase.from("offers").select("*").eq("id",offerId).single(); if(!offer)return NextResponse.json({error:"Offer not found"},{status:404});
 if(offer.buyer_id!==user.id&&offer.seller_id!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});
 let update:Record<string,unknown>={updated_at:new Date().toISOString()};
 if(action==="accept"&&offer.seller_id===user.id) update.status="accepted";
 else if(action==="decline"&&offer.seller_id===user.id) update.status="declined";
 else if(action==="withdraw"&&offer.buyer_id===user.id) update.status="withdrawn";
 else if(action==="counter"&&offer.seller_id===user.id&&Number(amount)>0){update.status="countered";update.counter_amount=Number(amount);update.counter_message=message||null;}
 else return NextResponse.json({error:"Unsupported offer action"},{status:400});
 const {data,error}=await supabase.from("offers").update(update).eq("id",offerId).select().single(); if(error)return NextResponse.json({error:error.message},{status:500});
 await supabase.from("offer_events").insert({offer_id:offerId,actor_id:user.id,event:action,metadata:{amount:amount||null,message:message||null}});
 return NextResponse.json({offer:data});
}
