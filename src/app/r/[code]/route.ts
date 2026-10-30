import { NextResponse, type NextRequest } from "next/server";

// Referral links (/r/CODE): remember the code for 30 days, then send the visitor to sign up.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  const res = NextResponse.redirect(new URL(code ? `/signup?ref=${code}` : "/signup", req.url));
  if (code) res.cookies.set("scolar_ref", code, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
  return res;
}
