import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyAdminPasswordOnly } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    const { data: members, error: memberErr } = await supabase
      .from("clyra_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (memberErr) {
      return NextResponse.json({ success: false, error: memberErr.message }, { status: 500 });
    }

    const { data: accessRows } = await supabase
      .from("clyra_member_access")
      .select("*, clyra_products(id, title, category)");

    return NextResponse.json({
      success: true,
      members: members || [],
      access: accessRows || [],
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, email, productId, orderId } = body;

    if (!passkey || !verifyAdminPasswordOnly(passkey)) {
      return NextResponse.json({ success: false, error: "Otorisasi admin ditolak." }, { status: 401 });
    }

    if (!email || !productId) {
      return NextResponse.json({ success: false, error: "Email dan Product ID wajib diisi." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = getServiceSupabase();

    // Check if access already granted
    const { data: existing } = await supabase
      .from("clyra_member_access")
      .select("id")
      .eq("member_email", cleanEmail)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: "Member ini sudah memiliki akses ke produk tersebut." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("clyra_member_access")
      .insert({
        member_email: cleanEmail,
        product_id: productId,
        order_id: orderId || "ADMIN_MANUAL",
        source: "admin_grant",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Akses produk ${productId} berhasil diberikan ke ${cleanEmail}`, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accessId = searchParams.get("accessId");
    const memberId = searchParams.get("memberId");

    const supabase = getServiceSupabase();

    if (accessId) {
      await supabase.from("clyra_member_access").delete().eq("id", accessId);
      return NextResponse.json({ success: true, message: "Hak akses produk berhasil dicabut." });
    }

    if (memberId) {
      await supabase.from("clyra_members").delete().eq("id", memberId);
      return NextResponse.json({ success: true, message: "Akun member berhasil dihapus." });
    }

    return NextResponse.json({ success: false, error: "ID tidak valid." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
