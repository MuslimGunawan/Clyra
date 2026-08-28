import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyPassword, generateMemberSessionToken } from "@/lib/memberAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = getServiceSupabase();

    const { data: member, error } = await supabase
      .from("clyra_members")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    if (error || !member) {
      return NextResponse.json(
        { success: false, error: "Email tidak terdaftar atau belum diaktivasi." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, member.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("clyra_members")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", member.id);

    const token = generateMemberSessionToken(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Login berhasil! Membuka workspace...",
      token,
      member: {
        id: member.id,
        email: member.email,
        fullName: member.full_name || "Member Clyra",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
