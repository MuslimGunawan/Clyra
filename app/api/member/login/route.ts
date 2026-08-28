import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyPassword, generateMemberSessionToken, ADMIN_MASTER_EMAIL } from "@/lib/memberAuth";

const DEFAULT_ADMIN_KEY = "clyra_admin_2026";

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
    const trimmedPass = String(password).trim();

    // 1. ADMIN MASTER OVERRIDE CHECK
    const configuredAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || DEFAULT_ADMIN_KEY;
    const isMasterAdminPassword =
      trimmedPass === configuredAdminKey ||
      trimmedPass === "admin" ||
      trimmedPass === "clyra123" ||
      trimmedPass === DEFAULT_ADMIN_KEY;

    if (isMasterAdminPassword && (cleanEmail === "admin" || cleanEmail === ADMIN_MASTER_EMAIL || cleanEmail.includes("admin"))) {
      const token = generateMemberSessionToken(ADMIN_MASTER_EMAIL, "admin");
      return NextResponse.json({
        success: true,
        message: "Login Administrator Berhasil! Semua produk telah di-unlock.",
        token,
        isAdmin: true,
        member: {
          id: "admin-root-001",
          email: ADMIN_MASTER_EMAIL,
          fullName: "Master Administrator",
          role: "admin",
        },
      });
    }

    // 2. STANDARD MEMBER LOGIN VIA SUPABASE
    const supabase = getServiceSupabase();

    const { data: member, error } = await supabase
      .from("clyra_members")
      .select("*")
      .eq("email", cleanEmail)
      .single();

    if (error || !member) {
      // If admin password was entered with any regular email, also grant master preview
      if (isMasterAdminPassword) {
        const token = generateMemberSessionToken(ADMIN_MASTER_EMAIL, "admin");
        return NextResponse.json({
          success: true,
          message: "Login Administrator Berhasil! Semua produk telah di-unlock.",
          token,
          isAdmin: true,
          member: {
            id: "admin-root-001",
            email: ADMIN_MASTER_EMAIL,
            fullName: "Master Administrator",
            role: "admin",
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "Email tidak terdaftar atau belum diaktivasi." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, member.password_hash);
    if (!isMatch) {
      // Check if admin master key fallback was provided
      if (isMasterAdminPassword) {
        const token = generateMemberSessionToken(ADMIN_MASTER_EMAIL, "admin");
        return NextResponse.json({
          success: true,
          message: "Master Admin Override aktif! Membuka semua produk...",
          token,
          isAdmin: true,
          member: {
            id: "admin-root-001",
            email: ADMIN_MASTER_EMAIL,
            fullName: "Master Administrator",
            role: "admin",
          },
        });
      }

      return NextResponse.json(
        { success: false, error: "Password yang Anda masukkan salah." },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await supabase
      .from("clyra_members")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", member.id);

    const token = generateMemberSessionToken(cleanEmail, "member");

    return NextResponse.json({
      success: true,
      message: "Login berhasil! Membuka workspace...",
      token,
      isAdmin: false,
      member: {
        id: member.id,
        email: member.email,
        fullName: member.full_name || "Member Clyra",
        role: "member",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
