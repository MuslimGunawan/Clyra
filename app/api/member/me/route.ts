import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyMemberSessionToken, ADMIN_MASTER_EMAIL } from "@/lib/memberAuth";
import { DEFAULT_DIGITAL_PRODUCTS } from "@/data/defaultProducts";

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

    const { email, role, valid } = verifyMemberSessionToken(token);
    if (!valid || !email) {
      return NextResponse.json(
        { success: false, error: "Sesi login kedaluwarsa atau tidak valid." },
        { status: 401 }
      );
    }

    const isAdmin = role === "admin" || email === ADMIN_MASTER_EMAIL || email === "admin";
    const supabase = getServiceSupabase();

    // ==========================================
    // 1. ADMIN MASTER OVERRIDE: UNLOCK ALL PRODUCTS
    // ==========================================
    if (isAdmin) {
      // Fetch all products from Supabase
      const { data: dbProducts } = await supabase
        .from("clyra_products")
        .select("*")
        .order("created_at", { ascending: false });

      // If DB has products, merge or use them; otherwise use DEFAULT_DIGITAL_PRODUCTS
      let allProducts: any[] = [];
      if (dbProducts && dbProducts.length > 0) {
        allProducts = dbProducts.map((p) => ({
          ...p,
          grantedAt: new Date().toISOString(),
          orderId: "ADMIN_MASTER_OVERRIDE",
        }));
      } else {
        allProducts = DEFAULT_DIGITAL_PRODUCTS.map((p) => ({
          ...p,
          grantedAt: new Date().toISOString(),
          orderId: "ADMIN_MASTER_OVERRIDE",
        }));
      }

      // Fetch admin notes or return default notes
      const { data: dbNotes } = await supabase
        .from("clyra_member_notes")
        .select("*")
        .eq("member_email", ADMIN_MASTER_EMAIL)
        .order("updated_at", { ascending: false });

      const adminNotes = dbNotes && dbNotes.length > 0 ? dbNotes : [
        {
          id: "admin-note-01",
          title: "🔐 Catatan Arsitektur Clyra Vault",
          content: "Workspace ini berjalan dalam mode Master Administrator. Seluruh ebook, script automation, prompt pack, dan starter kit terbuka 100% tanpa batasan.",
          updated_at: new Date().toISOString(),
        }
      ];

      return NextResponse.json({
        success: true,
        isAdmin: true,
        member: {
          id: "admin-root-001",
          email: ADMIN_MASTER_EMAIL,
          full_name: "Master Administrator",
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
          status: "active",
          role: "admin",
        },
        products: allProducts,
        notes: adminNotes,
      });
    }

    // ==========================================
    // 2. STANDARD REGULAR MEMBER
    // ==========================================
    // Get Member Profile
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

    // Get Member Purchased Products
    const { data: accessRows } = await supabase
      .from("clyra_member_access")
      .select("product_id, granted_at, order_id, clyra_products(*)")
      .eq("member_email", email);

    const purchasedProducts = (accessRows || []).map((row: any) => ({
      ...row.clyra_products,
      grantedAt: row.granted_at,
      orderId: row.order_id,
    }));

    // Get Member Notes
    const { data: notes } = await supabase
      .from("clyra_member_notes")
      .select("*")
      .eq("member_email", email)
      .order("updated_at", { ascending: false });

    return NextResponse.json({
      success: true,
      isAdmin: false,
      member: {
        ...member,
        role: "member",
      },
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
