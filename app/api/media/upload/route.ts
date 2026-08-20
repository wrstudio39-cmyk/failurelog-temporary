import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req:Request){
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const form=await req.formData(); const listingId=String(form.get("listingId")||""); const file=form.get("file"); if(!listingId||!(file instanceof File))return NextResponse.json({error:"listingId and file required"},{status:400});
 const {data:listing}=await supabase.from("listings").select("id,seller_id").eq("id",listingId).single(); if(!listing||listing.seller_id!==user.id)return NextResponse.json({error:"Forbidden"},{status:403});
 const admin=createAdminClient(); if(!admin)return NextResponse.json({error:"Storage unavailable"},{status:501});
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_"); const path=`${user.id}/${listingId}/${crypto.randomUUID()}-${safe}`; const bytes=new Uint8Array(await file.arrayBuffer());
 const up=await admin.storage.from("listing-media").upload(path,bytes,{contentType:file.type||"image/jpeg",upsert:false}); if(up.error)return NextResponse.json({error:up.error.message},{status:500});
 const pub=admin.storage.from("listing-media").getPublicUrl(path); const row=await admin.from("project_media").insert({listing_id:listingId,url:pub.data.publicUrl,alt:file.name,is_cover:false,sort_order:0}).select().single();
 if(row.error){await admin.storage.from("listing-media").remove([path]);return NextResponse.json({error:row.error.message},{status:500});}
 return NextResponse.json({media:row.data});
}
