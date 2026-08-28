import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyAdminPasswordOnly } from "@/lib/adminAuth";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const { data: products, error } = await supabase
      .from("clyra_products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: products || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passkey, product } = body;

    if (!passkey || !verifyAdminPasswordOnly(passkey)) {
      return NextResponse.json({ success: false, error: "Otorisasi admin ditolak." }, { status: 401 });
    }

    if (!product || !product.id || !product.title) {
      return NextResponse.json({ success: false, error: "ID Produk dan Judul wajib diisi." }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const payload = {
      id: product.id.toLowerCase().trim().replace(/\s+/g, "-"),
      title: product.title.trim(),
      tagline: product.tagline?.trim() || "",
      description: product.description?.trim() || "",
      category: product.category || "Ebook",
      cover_image: product.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      version: product.version || "v1.0.0",
      badge: product.badge || "PRODUK DIGITAL",
      download_url: product.download_url?.trim() || "",
      content_body: product.content_body || "",
    };

    const { data, error } = await supabase
      .from("clyra_products")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Produk ${product.title} berhasil disimpan!`, product: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });

    const supabase = getServiceSupabase();
    const { error } = await supabase.from("clyra_products").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Produk ${id} berhasil dihapus.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
