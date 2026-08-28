import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // 1. Verify Merchant Key / Signature if configured
    const merchantKey = process.env.LYNK_MERCHANT_KEY;
    const reqKey = req.headers.get("x-merchant-key") || req.headers.get("authorization") || body.merchant_key || body.secret_key;

    if (merchantKey && reqKey && reqKey !== merchantKey) {
      return NextResponse.json({ error: "Invalid Merchant Key signature" }, { status: 401 });
    }

    // 2. Extract Data from Lynk.id Webhook payload format
    // Lynk.id standard payload structures:
    // { event: "transaction.success", data: { email: "...", product_id: "...", ... } }
    // OR { status: "PAID" / "SUCCESS", customer_email: "...", trx_id: "...", item_id: "..." }
    const data = body.data || body;

    const email = (
      data.email ||
      data.customer_email ||
      data.buyer_email ||
      data.user_email ||
      ""
    ).toLowerCase().trim();

    const orderId = data.order_id || data.trx_id || data.transaction_id || data.id || `LYNK_${Date.now()}`;
    const rawStatus = (data.status || data.transaction_status || body.event || "SUCCESS").toUpperCase();
    const isPaid = rawStatus.includes("PAID") || rawStatus.includes("SUCCESS") || rawStatus.includes("SETTLEMENT") || rawStatus.includes("COMPLETED");

    // Extract product ID / identifier
    const productId = (
      data.product_id ||
      data.item_id ||
      data.sku ||
      data.product_slug ||
      "ebook-ai-prompts-mastery" // Default fallback product
    );

    if (!email) {
      return NextResponse.json({ success: true, message: "Webhook received but no buyer email found in payload (Ignored)" });
    }

    if (!isPaid) {
      return NextResponse.json({ success: true, message: `Status is ${rawStatus}, not paid (Ignored)` });
    }

    const supabase = getServiceSupabase();

    // 3. Grant Product Access in Supabase
    const { data: existingAccess } = await supabase
      .from("clyra_member_access")
      .select("id")
      .eq("member_email", email)
      .eq("product_id", productId)
      .single();

    if (!existingAccess) {
      await supabase.from("clyra_member_access").insert({
        member_email: email,
        product_id: productId,
        order_id: String(orderId),
        source: "lynk_id_webhook",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memberikan akses produk ${productId} untuk ${email}`,
      orderId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Webhook Error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Support GET request for Lynk.id test URL handshake
export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "Clyra Lynk.id Webhook Listener v1.0",
    timestamp: new Date().toISOString(),
  });
}
