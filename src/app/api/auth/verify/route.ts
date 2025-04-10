import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const JWTSECRET = process.env.JWTSECRET; 
    if (!JWTSECRET) {
      throw new Error("JWTSECRET is not defined in .env file");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, JWTSECRET) as { role: string; id: string };

    return NextResponse.json({
      authenticated: true,
      role: decodedToken.role,
      userId: decodedToken.id
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
