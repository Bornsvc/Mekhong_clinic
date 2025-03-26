import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log(decoded)
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.log("Error from auth/verrify: ", error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}