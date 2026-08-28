import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { hashPassword, generateMemberSessionToken } from "@/lib/memberAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, productId, orderId } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter demi keamanan." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Check if member already exists
    const { data: existingMember, error: findError } = await supabase
      .from("clyra_members")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    const passwordHash = await hashPassword(password);
    let memberId: string;

    if (existingMember) {
      // Member already exists, update password if re-activating
      const { data: updatedMember, error: updateError } = await supabase
        .from("clyra_members")
        .update({
          password_hash: passwordHash,
          full_name: fullName || existingMember.full_name || "Member Clyra",
          last_login_at: new Date().toISOString(),
        })
        .eq("email", cleanEmail)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, error: `Gagal memperbarui akun: ${updateError.message}` },
          { status: 500 }
        );
      }
      memberId = updatedMember.id;
    } else {
      // Create new member
      const { data: newMember, error: insertError } = await supabase
        .from("clyra_members")
        .insert({
          email: cleanEmail,
          password_hash: passwordHash,
          full_name: fullName || "Member Clyra",
          status: "active",
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { success: false, error: `Gagal membuat akun: ${insertError.message}` },
          { status: 500 }
        );
      }
      memberId = newMember.id;
    }

    // 2. Grant product access if productId is specified
    if (productId) {
      const { data: existingAccess } = await supabase
        .from("clyra_member_access")
        .select("id")
        .eq("member_email", cleanEmail)
        .eq("product_id", productId)
        .single();

      if (!existingAccess) {
        await supabase.from("clyra_member_access").insert({
          member_email: cleanEmail,
          product_id: productId,
          order_id: orderId || "LYNK_AUTO",
          source: "lynk_id",
        });
      }
    }

    // 3. Generate session token
    const token = generateMemberSessionToken(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Akun member dan workspace berhasil diaktifkan!",
      token,
      member: {
        id: memberId,
        email: cleanEmail,
        fullName: fullName || "Member Clyra",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
