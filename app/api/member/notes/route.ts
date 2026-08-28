import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { verifyMemberSessionToken } from "@/lib/memberAuth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { email, valid } = verifyMemberSessionToken(token);
    if (!valid || !email) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const { id, title, content } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Judul catatan wajib diisi." }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (id) {
      // Update existing note
      const { data, error } = await supabase
        .from("clyra_member_notes")
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("member_email", email)
        .select()
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, note: data });
    } else {
      // Insert new note
      const { data, error } = await supabase
        .from("clyra_member_notes")
        .insert({
          member_email: email,
          title,
          content,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, note: data });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { email, valid } = verifyMemberSessionToken(token);
    if (!valid || !email) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "Note ID required" }, { status: 400 });

    const supabase = getServiceSupabase();
    await supabase.from("clyra_member_notes").delete().eq("id", id).eq("member_email", email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
