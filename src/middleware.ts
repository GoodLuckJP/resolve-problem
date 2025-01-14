import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ミドルウェアの適用範囲を指定
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"], // 適用するルート
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl; // リクエストURLを取得
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  }); // JWTトークンを取得

  console.log("ミドルウェア実行中:", url.pathname, "トークン:", token);

  const isLoggedIn = Boolean(token); // トークンが存在すればログイン済み

  // 未ログインの場合、ダッシュボードへのアクセスをログインページへリダイレクト
  if (url.pathname.startsWith("/dashboard") && !isLoggedIn) {
    console.log("未ログイン。リダイレクト中: /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン済みの場合、ログインページへのアクセスをダッシュボードへリダイレクト
  if (url.pathname.startsWith("/login") && isLoggedIn) {
    console.log("ログイン済み。リダイレクト中: /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (url.pathname.startsWith("/register") && isLoggedIn) {
    console.log("ログイン済み。リダイレクト中: /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 通常のリクエストはそのまま続行
  return NextResponse.next();
}
