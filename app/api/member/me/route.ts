import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyMemberSessionToken } from "@/lib/memberAuth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Tidak ada token sesi." },
        { status: 401 }
      );
    }

    const { email, valid } = verifyMemberSessionToken(token);
    if (!valid || !email) {
      return NextResponse.json(
        { success: false, error: "Sesi login kedaluwarsa atau tidak valid." },
        { status: 401 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Get Member Profile
    const { data: member, error: memberError } = await supabase
      .from("clyra_members")
      .select("id, email, full_name, created_at, last_login_at, status")
      .eq("email", email)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { success: false, error: "Data member tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Get Member Purchased Products
    const { data: accessRows } = await supabase
      .from("clyra_member_access")
      .select("product_id, granted_at, order_id, clyra_products(*)")
      .eq("member_email", email);

    const purchasedProducts = (accessRows || []).map((row: any) => ({
      ...row.clyra_products,
      grantedAt: row.granted_at,
      orderId: row.order_id,
    }));

    // 3. Get Member Notes
    const { data: notes } = await supabase
      .from("clyra_member_notes")
      .select("*")
      .eq("member_email", email)
      .order("updated_at", { ascending: false });

    return NextResponse.json({
      success: true,
      member,
      products: purchasedProducts,
      notes: notes || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
